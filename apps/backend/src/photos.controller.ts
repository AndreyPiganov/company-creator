import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { readFile } from "node:fs/promises";
import { defaultPhotoPath, MAX_PHOTO_BYTES, photoPath, storePhoto } from "./lib/media/photos";

@Controller("api")
export class PhotosController {
  @Post("photos")
  @UseInterceptors(FileInterceptor("photo", { limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 0 } }))
  async upload(@UploadedFile() file?: { buffer: Buffer }) {
    if (!file?.buffer) throw new BadRequestException({ error: "Выберите фотографию" });
    try { return { asset: await storePhoto(file.buffer) }; }
    catch { throw new BadRequestException({ error: "Не удалось загрузить фото. Выберите JPEG, PNG или WebP до 5 МБ и 20 мегапикселей." }); }
  }

  @Get("photos/:file")
  async photo(@Param("file") file: string, @Res() response: Response) {
    try {
      const content = await readFile(photoPath(file));
      response.set({ "content-type": "image/jpeg", "cache-control": "private, max-age=31536000, immutable", "x-content-type-options": "nosniff" }).send(content);
    } catch { throw new NotFoundException({ error: "Фотография не найдена" }); }
  }

  @Get("team-assets/:file")
  async defaultPhoto(@Param("file") file: string, @Res() response: Response) {
    try {
      const content = await readFile(defaultPhotoPath(`/assets/team/${file}`));
      response.set({ "content-type": "image/png", "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" }).send(content);
    } catch { throw new NotFoundException({ error: "Портрет не найден" }); }
  }
}
