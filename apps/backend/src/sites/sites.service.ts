import { Injectable } from "@nestjs/common";
import { parseBody } from "../common/http";
import { RepositoryService } from "../database/repository.service";
import { siteGenerationInputSchema, type SiteLanguage, type SiteTheme } from "../lib/domain/company";
import { safeErrorMessage } from "../lib/http";
import { createSiteArtifact } from "../lib/site/artifacts";

@Injectable()
export class SitesService {
  constructor(private readonly repository: RepositoryService) {}

  list(companyId: string) {
    return this.repository.listSiteVersions(companyId);
  }

  get(id: string) {
    return this.repository.getSiteVersion(id);
  }

  parseInput(input: unknown): { language: SiteLanguage; theme: SiteTheme } {
    return parseBody(siteGenerationInputSchema, input, "Некорректные параметры сайта");
  }

  async enqueue(companyId: string, input: { language: SiteLanguage; theme: SiteTheme }) {
    const job = await this.repository.createJob("site", { companyId, ...input });
    setImmediate(() => void this.run(job.id, companyId, input));
    return job;
  }

  private async run(
    jobId: string,
    companyId: string,
    input: { language: SiteLanguage; theme: SiteTheme },
  ): Promise<void> {
    try {
      await this.repository.updateJob(jobId, { state: "preparing", attempt: 1, error: null });
      const profile = await this.repository.getCompany(companyId);
      if (!profile) throw new Error("Компания не найдена");
      if (profile.status !== "approved") throw new Error("Перед созданием сайта утвердите карточку компании");
      const version = await this.repository.nextSiteVersion(companyId);
      const id = crypto.randomUUID();
      await this.repository.updateJob(jobId, { state: "rendering" });
      const artifact = await createSiteArtifact(id, structuredClone(profile), input.language, input.theme);
      await this.repository.updateJob(jobId, { state: "saving" });
      await this.repository.insertSiteVersion({
        id,
        companyId,
        version,
        ...input,
        snapshot: structuredClone(profile),
        ...artifact,
      });
      await this.repository.updateJob(jobId, { state: "complete", resultId: id, error: null });
    } catch (error) {
      await this.repository.updateJob(jobId, { state: "failed", error: safeErrorMessage(error) });
    }
  }
}
