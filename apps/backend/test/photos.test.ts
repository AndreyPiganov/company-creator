import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { PhotosController } from "@/photos.controller";
import { createSiteArtifact } from "@/lib/site/artifacts";
import { sampleCompanies } from "@/lib/generation/samples";
import { companyProfileSchema } from "@/lib/domain/company";

let app: INestApplication;
let base: string;
let root: string;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "company-photos-"));
  vi.stubEnv("PHOTOS_PATH", path.join(root, "photos"));
  vi.stubEnv("ARTIFACTS_PATH", path.join(root, "sites"));
  const module = await Test.createTestingModule({ controllers: [PhotosController] }).compile();
  app = module.createNestApplication({ logger: false });
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
});

afterAll(async () => {
  await app?.close();
  await rm(root, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

async function upload(bytes: Buffer, name = "portrait.png", type = "image/png") {
  const form = new FormData();
  form.set("photo", new Blob([new Uint8Array(bytes)], { type }), name);
  return fetch(`${base}/api/photos`, { method: "POST", body: form });
}

describe("employee portraits", () => {
  it("validates bytes, normalizes images and embeds immutable local copies in site versions", async () => {
    const image = await sharp({ create: { width: 120, height: 180, channels: 3, background: "#42a571" } }).png().toBuffer();
    const uploaded = await upload(image);
    expect(uploaded.status).toBe(201);
    const { asset } = z.object({ asset: z.string() }).parse(await uploaded.json());
    const served = await fetch(base + asset);
    expect(served.headers.get("content-type")).toContain("image/jpeg");
    const bytes = Buffer.from(await served.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    expect(metadata).toMatchObject({ width: 960, height: 1280, format: "jpeg" });
    expect(metadata.exif).toBeUndefined();
    const company = structuredClone(sampleCompanies[0]);
    company.team[0].photo.asset = asset;
    const first = await createSiteArtifact(crypto.randomUUID(), company, "ru", "forest");
    const firstPhoto = await readFile(path.join(first.artifactPath, "assets/person-0.jpg"));
    expect(firstPhoto).toEqual(bytes);
    const html = await readFile(path.join(first.artifactPath, "company.html"), "utf8");
    expect(html).toContain('src="assets/person-0.jpg"');
    expect(html).not.toContain(asset);
    const secondImage = await sharp({ create: { width: 120, height: 180, channels: 3, background: "#914aa1" } }).png().toBuffer();
    company.team[0].photo.asset = z.object({ asset: z.string() }).parse(await (await upload(secondImage)).json()).asset;
    const second = await createSiteArtifact(crypto.randomUUID(), company, "de", "berry");
    expect(await readFile(path.join(first.artifactPath, "assets/person-0.jpg"))).toEqual(firstPhoto);
    expect(await readFile(path.join(second.artifactPath, "assets/person-0.jpg"))).not.toEqual(firstPhoto);
    expect(second.checksum).not.toBe(first.checksum);
  });

  it("rejects disguised files, unsupported formats, oversized uploads and external photo paths", async () => {
    expect((await upload(Buffer.from("not an image"))).status).toBe(400);
    expect((await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'), "photo.svg", "image/svg+xml")).status).toBe(400);
    expect((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status).toBe(413);
    const company = structuredClone(sampleCompanies[0]);
    company.team[0].photo.asset = "https://outside.example/face.jpg";
    expect(companyProfileSchema.safeParse(company).success).toBe(false);
    company.team[0].photo.asset = "/api/photos/../../secret.txt";
    expect(companyProfileSchema.safeParse(company).success).toBe(false);
    expect((await fetch(`${base}/api/photos/secret.txt`)).status).toBe(404);
  });
});
