import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";
import { PrismaService } from "@/prisma/prisma.service";
import { RepositoryService } from "@/database/repository.service";

let prisma: PrismaService;
let repository: RepositoryService;
const companyIds: string[] = [];

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.onModuleInit();
  repository = new RepositoryService(prisma);
});

afterAll(async () => {
  await prisma.company.deleteMany({ where: { id: { in: companyIds } } });
  await prisma.onModuleDestroy();
});

describe("company repository", () => {
  it("returns an approved company to draft after editing", async () => {
    const original = structuredClone(sampleCompanies[0]);
    original.id = crypto.randomUUID();
    companyIds.push(original.id);
    original.team = original.team.map((member) => ({ ...member, id: crypto.randomUUID() }));
    original.faq = original.faq.map((item) => ({ ...item, id: crypto.randomUUID() }));
    await repository.insertCompany(original);
    const updated = await repository.updateCompany(original.id, { ...original, brandName: "Revised Brand" });
    expect(updated).toMatchObject({ brandName: "Revised Brand", status: "draft", revision: 2 });
    const approved = await repository.approveCompany(original.id);
    expect(approved?.status).toBe("approved");
  });

  it("keeps a site snapshot unchanged after later company edits", async () => {
    const original = structuredClone(sampleCompanies[1]);
    original.id = crypto.randomUUID();
    companyIds.push(original.id);
    original.team = original.team.map((member) => ({ ...member, id: crypto.randomUUID() }));
    original.faq = original.faq.map((item) => ({ ...item, id: crypto.randomUUID() }));
    await repository.insertCompany(original);
    const siteId = crypto.randomUUID();
    await repository.insertSiteVersion({ id: siteId, companyId: original.id, version: 1, language: "de", theme: "midnight", snapshot: structuredClone(original), artifactPath: "/tmp/test-artifact", checksum: "abc" });
    await repository.updateCompany(original.id, { ...original, brandName: "Changed Later" });
    const site = await repository.getSiteVersion(siteId);
    const current = await repository.getCompany(original.id);
    expect(site?.snapshot.brandName).toBe(original.brandName);
    expect(current?.brandName).toBe("Changed Later");
  });
});
