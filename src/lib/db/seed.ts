import { sampleCompanies } from "@/lib/generation/samples";
import { artifactExists, createSiteArtifact } from "@/lib/site/artifacts";
import { getSiteVersion, insertCompany, insertSiteVersion } from "./repository";

let seedPromise: Promise<void> | undefined;

export function ensureSeedData(): Promise<void> {
  seedPromise ??= (async () => {
    await Promise.all(sampleCompanies.map((company) => insertCompany(company)));
    const examples = [
      { id: "a30e21e7-36ea-42c7-a99f-8ab6534a3101", company: sampleCompanies[0], language: "ru" as const, theme: "forest" as const },
      { id: "b41f32f8-47fb-43d8-baa0-9bc7645b4202", company: sampleCompanies[1], language: "de" as const, theme: "midnight" as const },
    ];
    for (const example of examples) {
      const existing = await getSiteVersion(example.id);
      if (existing && (await artifactExists(existing.artifactPath))) continue;
      const artifact = await createSiteArtifact(example.id, structuredClone(example.company), example.language, example.theme);
      if (!existing) {
        await insertSiteVersion({
          id: example.id,
          companyId: example.company.id,
          version: 1,
          language: example.language,
          theme: example.theme,
          snapshot: structuredClone(example.company),
          ...artifact,
        });
      }
    }
  })();
  return seedPromise;
}
