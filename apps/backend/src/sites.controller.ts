import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import archiver from "archiver";
import type { Response } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PREVIEW_FILES, resolveArtifactPath } from "./lib/site/artifacts";
import { SitesService } from "./sites/sites.service";

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "website";
}

@Controller()
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get("sites/:id/preview")
  previewIndex(@Param("id") id: string, @Res() response: Response) {
    return this.sendPreview(id, "index.html", response);
  }

  @Get("sites/:id/preview/assets/:file")
  previewTeam(@Param("id") id: string, @Param("file") file: string, @Res() response: Response) {
    return this.sendPreview(id, `assets/${file}`, response);
  }

  @Get("sites/:id/preview/:file")
  previewFile(@Param("id") id: string, @Param("file") file: string, @Res() response: Response) {
    return this.sendPreview(id, file, response);
  }

  @Get("api/sites/:id/download")
  async download(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const site = await this.sites.get(id);
    if (!site) throw new NotFoundException({ error: "Версия сайта не найдена" });
    response.set({
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${slug(site.snapshot.brandName)}-v${site.version}-${site.language}.zip"`,
      "cache-control": "no-store",
    });
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) => response.destroy(error));
    archive.pipe(response);
    archive.directory(resolveArtifactPath(site.artifactPath), false);
    await archive.finalize();
  }

  private async sendPreview(id: string, file: string, response: Response): Promise<void> {
    const contentType = PREVIEW_FILES[file];
    if (!contentType) throw new NotFoundException({ error: "Файл не найден" });
    const site = await this.sites.get(id);
    if (!site) throw new NotFoundException({ error: "Версия сайта не найдена" });
    try {
      const contents = await readFile(path.join(resolveArtifactPath(site.artifactPath), ...file.split("/")));
      response.set({ "content-type": contentType, "cache-control": "private, max-age=60" });
      response.send(contents);
    } catch {
      throw new NotFoundException({ error: "Файл артефакта не найден" });
    }
  }
}
