import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { sampleCompanies } from "@/lib/generation/samples";
import { approveCompany, getCompany, getSiteVersion, insertCompany, insertSiteVersion, updateCompany } from "@/lib/db/repository";

const databasePath = path.join("/tmp", `company-creator-test-${process.pid}.sqlite`);

beforeAll(() => {
  process.env.DATABASE_PATH = databasePath;
});

afterAll(async () => {
  for (const suffix of ["", "-wal", "-shm"]) await unlink(`${databasePath}${suffix}`).catch(() => undefined);
});

describe("company repository", () => {
  it("returns an approved company to draft after editing", async () => {
    const original = structuredClone(sampleCompanies[0]);
    original.id = crypto.randomUUID();
    original.team = original.team.map((member) => ({ ...member, id: crypto.randomUUID() }));
    original.faq = original.faq.map((item) => ({ ...item, id: crypto.randomUUID() }));
    await insertCompany(original);
    const updated = await updateCompany(original.id, { ...original, brandName: "Revised Brand" });
    expect(updated).toMatchObject({ brandName: "Revised Brand", status: "draft", revision: 2 });
    const approved = await approveCompany(original.id);
    expect(approved?.status).toBe("approved");
  });

  it("keeps a site snapshot unchanged after later company edits", async () => {
    const original = structuredClone(sampleCompanies[1]);
    original.id = crypto.randomUUID();
    original.team = original.team.map((member) => ({ ...member, id: crypto.randomUUID() }));
    original.faq = original.faq.map((item) => ({ ...item, id: crypto.randomUUID() }));
    await insertCompany(original);
    const siteId = crypto.randomUUID();
    await insertSiteVersion({ id: siteId, companyId: original.id, version: 1, language: "de", theme: "midnight", snapshot: structuredClone(original), artifactPath: "/tmp/test-artifact", checksum: "abc" });
    await updateCompany(original.id, { ...original, brandName: "Changed Later" });
    const site = await getSiteVersion(siteId);
    const current = await getCompany(original.id);
    expect(site?.snapshot.brandName).toBe(original.brandName);
    expect(current?.brandName).toBe("Changed Later");
  });
});
