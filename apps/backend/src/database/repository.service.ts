import { Injectable } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CompanyProfile, CompanySummary, SiteLanguage, SiteTheme } from "../lib/domain/company";
import { assertValidCompany, validateCompanyConsistency } from "../lib/domain/validate";

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

export type GenerationJob = {
  id: string;
  kind: "company" | "site";
  state: JobState;
  attempt: number;
  costUsd: number;
  input: unknown;
  resultId: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

@Injectable()
export class RepositoryService {
  constructor(private readonly prisma: PrismaService) {}

  async checkConnection(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  async insertCompany(profileInput: CompanyProfile): Promise<CompanyProfile> {
    const profile = assertValidCompany(profileInput);
    const now = new Date();
    await this.prisma.company.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        brandName: profile.brandName,
        status: profile.status,
        revision: profile.revision,
        profileJson: toJson(profile),
        createdAt: now,
        updatedAt: now,
        approvedAt: profile.status === "approved" ? now : null,
      },
      update: {},
    });
    return profile;
  }

  async listCompanies(): Promise<CompanySummary[]> {
    const rows = await this.prisma.company.findMany({
      include: { _count: { select: { sites: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((row) => {
      const profile = assertValidCompany(row.profileJson);
      return {
        id: profile.id,
        brandName: profile.brandName,
        legalName: profile.legalName,
        status: profile.status,
        revision: profile.revision,
        size: profile.size,
        serviceType: profile.serviceType,
        city: profile.contact.city,
        updatedAt: row.updatedAt.toISOString(),
        siteCount: row._count.sites,
      };
    });
  }

  async getCompany(id: string): Promise<CompanyProfile | null> {
    const row = await this.prisma.company.findUnique({ where: { id } });
    return row ? assertValidCompany(row.profileJson) : null;
  }

  async updateCompany(id: string, input: unknown): Promise<CompanyProfile | null> {
    const current = await this.getCompany(id);
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
    await this.prisma.company.update({
      where: { id },
      data: {
        brandName: validation.profile.brandName,
        status: "draft",
        revision: validation.profile.revision,
        profileJson: toJson(validation.profile),
        approvedAt: null,
      },
    });
    return validation.profile;
  }

  async approveCompany(id: string): Promise<CompanyProfile | null> {
    const current = await this.getCompany(id);
    if (!current) return null;
    const approved = assertValidCompany({ ...current, status: "approved" });
    await this.prisma.company.update({
      where: { id },
      data: { status: "approved", profileJson: toJson(approved), approvedAt: new Date() },
    });
    return approved;
  }

  async insertSiteVersion(input: {
    id: string;
    companyId: string;
    version: number;
    language: SiteLanguage;
    theme: SiteTheme;
    snapshot: CompanyProfile;
    artifactPath: string;
    checksum: string;
  }): Promise<void> {
    await this.prisma.siteVersion.create({
      data: {
        id: input.id,
        companyId: input.companyId,
        version: input.version,
        language: input.language,
        theme: input.theme,
        snapshotJson: toJson(assertValidCompany(input.snapshot)),
        artifactPath: input.artifactPath,
        checksum: input.checksum,
      },
    });
  }

  async nextSiteVersion(companyId: string): Promise<number> {
    const result = await this.prisma.siteVersion.aggregate({
      where: { companyId },
      _max: { version: true },
    });
    return (result._max.version ?? 0) + 1;
  }

  async listSiteVersions(companyId?: string) {
    return this.prisma.siteVersion.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: companyId ? { version: "desc" } : { createdAt: "desc" },
    });
  }

  async getSiteVersion(id: string) {
    const row = await this.prisma.siteVersion.findUnique({ where: { id } });
    return row ? { ...row, snapshot: assertValidCompany(row.snapshotJson) } : null;
  }

  async createJob(kind: "company" | "site", input: unknown): Promise<GenerationJob> {
    const row = await this.prisma.generationJob.create({
      data: {
        id: crypto.randomUUID(),
        kind,
        state: "queued",
        inputJson: toJson(input),
      },
    });
    return this.toJob(row);
  }

  async getJob(id: string): Promise<GenerationJob | null> {
    const row = await this.prisma.generationJob.findUnique({ where: { id } });
    return row ? this.toJob(row) : null;
  }

  async updateJob(
    id: string,
    patch: Partial<Pick<GenerationJob, "state" | "attempt" | "costUsd" | "resultId" | "error">>,
  ): Promise<void> {
    await this.prisma.generationJob.update({ where: { id }, data: patch });
  }

  private toJob(row: {
    id: string;
    kind: string;
    state: string;
    attempt: number;
    costUsd: number;
    inputJson: unknown;
    resultId: string | null;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): GenerationJob {
    return {
      id: row.id,
      kind: row.kind as GenerationJob["kind"],
      state: row.state as JobState,
      attempt: row.attempt,
      costUsd: row.costUsd,
      input: row.inputJson,
      resultId: row.resultId,
      error: row.error,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
