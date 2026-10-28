import { getCompany, insertSiteVersion, nextSiteVersion, updateJob } from "@/lib/db/repository";
import type { SiteLanguage, SiteTheme } from "@/lib/domain/company";
import { safeErrorMessage } from "@/lib/http";
import { createSiteArtifact } from "@/lib/site/artifacts";

export async function runSiteGenerationJob(
  jobId: string,
  companyId: string,
  input: { language: SiteLanguage; theme: SiteTheme },
): Promise<void> {
  try {
    await updateJob(jobId, { state: "preparing", attempt: 1, error: null });
    const profile = await getCompany(companyId);
    if (!profile) throw new Error("Компания не найдена");
    if (profile.status !== "approved") throw new Error("Перед созданием сайта утвердите карточку компании");
    const version = await nextSiteVersion(companyId);
    const id = crypto.randomUUID();
    await updateJob(jobId, { state: "rendering" });
    const artifact = await createSiteArtifact(id, structuredClone(profile), input.language, input.theme);
    await updateJob(jobId, { state: "saving" });
    await insertSiteVersion({ id, companyId, version, ...input, snapshot: structuredClone(profile), ...artifact });
    await updateJob(jobId, { state: "complete", resultId: id, error: null });
  } catch (error) {
    await updateJob(jobId, { state: "failed", error: safeErrorMessage(error) });
  }
}
