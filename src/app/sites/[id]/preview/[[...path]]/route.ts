import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSiteVersion } from "@/lib/db/repository";
import { apiError } from "@/lib/http";
import { PREVIEW_FILES, resolveArtifactPath } from "@/lib/site/artifacts";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string; path?: string[] }> }) {
  const params = await context.params;
  const site = await getSiteVersion(params.id);
  if (!site) return apiError("Версия сайта не найдена", 404);
  const file = params.path?.join("/") || "index.html";
  const contentType = PREVIEW_FILES[file];
  if (!contentType) return apiError("Файл не найден", 404);
  try {
    const contents = await readFile(path.join(resolveArtifactPath(site.artifactPath), ...file.split("/")));
    return new Response(contents, { headers: { "content-type": contentType, "cache-control": "private, max-age=60" } });
  } catch {
    return apiError("Файл артефакта не найден", 404);
  }
}
