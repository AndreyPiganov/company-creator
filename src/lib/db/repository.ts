import { and, count, desc, eq, sql } from "drizzle-orm";
import { assertValidCompany, validateCompanyConsistency } from "@/lib/domain/validate";
import type { CompanyProfile, CompanySummary, SiteLanguage, SiteTheme } from "@/lib/domain/company";
import { getDatabase } from "./client";
import { companies, generationJobs, siteVersions, type GenerationJobRow, type SiteVersionRow } from "./schema";

export type JobState =
  | "queued"
  | "preparing"
  | "requesting"
  | "validating"
  | "retrying"
  | "saving"
  | "rendering"
  | "complete"
  | "failed";

export type GenerationJob = Omit<GenerationJobRow, "inputJson"> & {
  state: JobState;
  input: unknown;
};

export async function insertCompany(profileInput: CompanyProfile): Promise<CompanyProfile> {
  const profile = assertValidCompany(profileInput);
  const now = new Date().toISOString();
  await getDatabase()
    .insert(companies)
    .values({
      id: profile.id,
      brandName: profile.brandName,
      status: profile.status,
      revision: profile.revision,
      profileJson: JSON.stringify(profile),
      createdAt: now,
      updatedAt: now,
      approvedAt: profile.status === "approved" ? now : null,
    })
    .onConflictDoNothing();
  return profile;
}

export async function listCompanies(): Promise<CompanySummary[]> {
  const db = getDatabase();
  const rows = await db
    .select({
      id: companies.id,
      profileJson: companies.profileJson,
      updatedAt: companies.updatedAt,
      siteCount: count(siteVersions.id),
    })
    .from(companies)
    .leftJoin(siteVersions, eq(siteVersions.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(desc(companies.updatedAt));

  return rows.map((row) => {
    const profile = assertValidCompany(JSON.parse(row.profileJson));
    return {
      id: profile.id,
      brandName: profile.brandName,
      legalName: profile.legalName,
      status: profile.status,
      revision: profile.revision,
      size: profile.size,
      serviceType: profile.serviceType,
      city: profile.contact.city,
      updatedAt: row.updatedAt,
      siteCount: row.siteCount,
    };
  });
}

export async function getCompany(id: string): Promise<CompanyProfile | null> {
  const rows = await getDatabase().select().from(companies).where(eq(companies.id, id)).limit(1);
  return rows[0] ? assertValidCompany(JSON.parse(rows[0].profileJson)) : null;
}

export async function updateCompany(id: string, input: unknown): Promise<CompanyProfile | null> {
  const current = await getCompany(id);
  if (!current) return null;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Validation failed") as Error & { issues?: Array<{ path: string; message: string }> };
    error.issues = [{ path: "", message: "Карточка должна быть JSON-объектом" }];
    throw error;
  }
  const candidate = {
    ...(input as Record<string, unknown>),
    id,
    status: "draft",
    revision: current.revision + 1,
    generation: current.generation,
  };
  const validation = validateCompanyConsistency(candidate);
  if (!validation.profile || validation.issues.length > 0) {
    const error = new Error("Validation failed") as Error & { issues?: typeof validation.issues };
    error.issues = validation.issues;
    throw error;
  }
  const now = new Date().toISOString();
  await getDatabase()
    .update(companies)
    .set({
      brandName: validation.profile.brandName,
      status: "draft",
      revision: validation.profile.revision,
      profileJson: JSON.stringify(validation.profile),
      updatedAt: now,
      approvedAt: null,
    })
    .where(eq(companies.id, id));
  return validation.profile;
}

export async function approveCompany(id: string): Promise<CompanyProfile | null> {
  const current = await getCompany(id);
  if (!current) return null;
  const approved = assertValidCompany({ ...current, status: "approved" });
  const now = new Date().toISOString();
  await getDatabase()
    .update(companies)
    .set({ status: "approved", profileJson: JSON.stringify(approved), updatedAt: now, approvedAt: now })
    .where(eq(companies.id, id));
  return approved;
}

export async function insertSiteVersion(input: {
  id: string;
  companyId: string;
  version: number;
  language: SiteLanguage;
  theme: SiteTheme;
  snapshot: CompanyProfile;
  artifactPath: string;
  checksum: string;
}): Promise<void> {
  await getDatabase().insert(siteVersions).values({
    id: input.id,
    companyId: input.companyId,
    version: input.version,
    language: input.language,
    theme: input.theme,
    snapshotJson: JSON.stringify(assertValidCompany(input.snapshot)),
    artifactPath: input.artifactPath,
    checksum: input.checksum,
    createdAt: new Date().toISOString(),
  });
}

export async function nextSiteVersion(companyId: string): Promise<number> {
  const rows = await getDatabase()
    .select({ maxVersion: sql<number>`coalesce(max(${siteVersions.version}), 0)` })
    .from(siteVersions)
    .where(eq(siteVersions.companyId, companyId));
  return Number(rows[0]?.maxVersion ?? 0) + 1;
}

export async function listSiteVersions(companyId?: string): Promise<SiteVersionRow[]> {
  const query = getDatabase().select().from(siteVersions);
  return companyId
    ? query.where(eq(siteVersions.companyId, companyId)).orderBy(desc(siteVersions.version))
    : query.orderBy(desc(siteVersions.createdAt));
}

export async function getSiteVersion(id: string): Promise<(SiteVersionRow & { snapshot: CompanyProfile }) | null> {
  const rows = await getDatabase().select().from(siteVersions).where(eq(siteVersions.id, id)).limit(1);
  if (!rows[0]) return null;
  return { ...rows[0], snapshot: assertValidCompany(JSON.parse(rows[0].snapshotJson)) };
}

export async function createJob(kind: "company" | "site", input: unknown): Promise<GenerationJob> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await getDatabase().insert(generationJobs).values({
    id,
    kind,
    state: "queued",
    attempt: 0,
    costUsd: 0,
    inputJson: JSON.stringify(input),
    createdAt: now,
    updatedAt: now,
  });
  return (await getJob(id))!;
}

export async function getJob(id: string): Promise<GenerationJob | null> {
  const rows = await getDatabase().select().from(generationJobs).where(eq(generationJobs.id, id)).limit(1);
  if (!rows[0]) return null;
  return { ...rows[0], state: rows[0].state as JobState, input: JSON.parse(rows[0].inputJson) };
}

export async function updateJob(
  id: string,
  patch: Partial<Pick<GenerationJobRow, "state" | "attempt" | "costUsd" | "resultId" | "error">>,
): Promise<void> {
  await getDatabase()
    .update(generationJobs)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(generationJobs.id, id));
}

export async function findSiteVersion(companyId: string, version: number): Promise<SiteVersionRow | null> {
  const rows = await getDatabase()
    .select()
    .from(siteVersions)
    .where(and(eq(siteVersions.companyId, companyId), eq(siteVersions.version, version)))
    .limit(1);
  return rows[0] ?? null;
}
