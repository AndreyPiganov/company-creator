import archiver from "archiver";
import { Readable } from "node:stream";
import { getSiteVersion } from "@/lib/db/repository";
import { apiError } from "@/lib/http";
import { resolveArtifactPath } from "@/lib/site/artifacts";

export const dynamic = "force-dynamic";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "website";
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const site = await getSiteVersion(id);
  if (!site) return apiError("Версия сайта не найдена", 404);
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.directory(resolveArtifactPath(site.artifactPath), false);
  void archive.finalize();
  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${slug(site.snapshot.brandName)}-v${site.version}-${site.language}.zip"`,
      "cache-control": "no-store",
    },
  });
}
