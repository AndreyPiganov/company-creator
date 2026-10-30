import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CompanyProfile, SiteLanguage, SiteTheme } from "../domain/company";
import { renderSiteFiles } from "./render";
import { readProfilePhoto, sitePhotoFile } from "../media/photos";
import { MAX_TEAM_SIZE } from "../domain/company";

export function artifactsRoot(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.ARTIFACTS_PATH || path.join(process.cwd(), "data", "sites"));
}

export function resolveArtifactPath(storedPath: string): string {
  const root = artifactsRoot();
  const resolved = path.resolve(storedPath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error("Artifact path escapes storage root");
  return resolved;
}

export async function artifactExists(directory: string): Promise<boolean> {
  try {
    return (await stat(path.join(resolveArtifactPath(directory), "index.html"))).isFile();
  } catch {
    return false;
  }
}

export async function createSiteArtifact(
  id: string,
  profile: CompanyProfile,
  language: SiteLanguage,
  theme: SiteTheme,
): Promise<{ artifactPath: string; checksum: string }> {
  const root = artifactsRoot();
  await mkdir(root, { recursive: true });
  const finalPath = path.join(/*turbopackIgnore: true*/ root, id);
  const temporaryPath = path.join(root, `.${id}-${crypto.randomUUID()}`);
  await mkdir(path.join(temporaryPath, "assets"), { recursive: true });
  try {
    const files = renderSiteFiles(profile, language, theme);
    const hash = createHash("sha256");
    for (const [name, content] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
      await writeFile(path.join(temporaryPath, name), content, "utf8");
      hash.update(name).update("\0").update(content);
    }
    for (const [index, member] of profile.team.entries()) {
      const file = sitePhotoFile(member.photo, index);
      const bytes = await readProfilePhoto(member.photo.asset);
      await writeFile(path.join(temporaryPath, file), bytes);
      hash.update(file).update("\0").update(bytes);
    }
    await rename(temporaryPath, finalPath);
    return { artifactPath: finalPath, checksum: hash.digest("hex") };
  } catch (error) {
    await rm(temporaryPath, { recursive: true, force: true });
    throw error;
  }
}

export const PREVIEW_FILES: Record<string, string> = {
  "index.html": "text/html; charset=utf-8",
  "product.html": "text/html; charset=utf-8",
  "company.html": "text/html; charset=utf-8",
  "styles.css": "text/css; charset=utf-8",
  "favicon.svg": "image/svg+xml",
  "assets/team.png": "image/png",
  ...Array.from({ length: MAX_TEAM_SIZE }, (_, i) => i).reduce<Record<string, string>>((files, index) => ({ ...files, [`assets/person-${index}.jpg`]: "image/jpeg", [`assets/person-${index}.png`]: "image/png" }), {}),
};
