import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { CompanyProfile } from "../domain/company";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_FILE_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/;
export const PHOTO_ASSET_PATTERN = /^\/api\/photos\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/;

function photosRoot() { return path.resolve(process.env.PHOTOS_PATH || path.join(process.cwd(), "data", "photos")); }

export function photoPath(file: string) {
  if (!PHOTO_FILE_PATTERN.test(file)) throw new Error("Некорректный идентификатор фотографии");
  return path.join(photosRoot(), file);
}

export async function storePhoto(bytes: Buffer): Promise<string> {
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) throw new Error("Фотография должна быть не больше 5 МБ");
  let output: Buffer;
  try {
    const image = sharp(bytes, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new Error();
    output = await image.rotate().resize(960, 1280, { fit: "cover", position: "centre" }).jpeg({ quality: 85 }).toBuffer();
  } catch { throw new Error("Нужна статичная фотография JPEG, PNG или WebP до 20 мегапикселей"); }
  const file = `${crypto.randomUUID()}.jpg`;
  await mkdir(photosRoot(), { recursive: true });
  await writeFile(photoPath(file), output, { flag: "wx", mode: 0o600 });
  return `/api/photos/${file}`;
}

export function defaultPhotoPath(asset: string) {
  if (!["/assets/team/team-warm.png", "/assets/team/team-cool.png"].includes(asset)) throw new Error("Неизвестный портрет");
  return path.join(path.resolve(process.env.TEAM_ASSETS_PATH || path.join(process.cwd(), "assets", "team")), path.basename(asset));
}

export async function readProfilePhoto(asset: string) {
  return readFile(PHOTO_ASSET_PATTERN.test(asset) ? photoPath(asset.slice("/api/photos/".length)) : defaultPhotoPath(asset));
}

export function sitePhotoFile(photo: CompanyProfile["team"][number]["photo"], index: number) {
  return `assets/person-${index}.${PHOTO_ASSET_PATTERN.test(photo.asset) ? "jpg" : "png"}`;
}
