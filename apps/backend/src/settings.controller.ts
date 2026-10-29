import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, InternalServerErrorException, Patch, Req } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { apiKeySchema, providerIdSchema, providerKeyStatuses, saveProviderKey } from "./lib/settings/provider-keys";
import { resetOpenRouterModels } from "./lib/ai/openrouter-provider";

const updateSchema = z.discriminatedUnion("action", [
  z.object({ provider: providerIdSchema, action: z.literal("save"), key: apiKeySchema }).strict(),
  z.object({ provider: providerIdSchema, action: z.literal("remove") }).strict(),
]);

@Controller("api/settings/providers")
export class SettingsController {
  @Get()
  @Header("Cache-Control", "no-store")
  async get() {
    return { providers: await providerKeyStatuses() };
  }

  @Patch()
  @Header("Cache-Control", "no-store")
  async update(@Body() body: unknown, @Req() request: Request) {
    const origin = request.headers.origin;
    const allowed = (process.env.FRONTEND_ORIGIN || "http://localhost:3000").split(",").map((value) => value.trim());
    if (origin && !allowed.includes(origin)) throw new ForbiddenException({ error: "Запрос с другого сайта запрещён" });
    if (!request.is("application/json")) throw new BadRequestException({ error: "Требуется JSON-запрос" });
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: "Выберите провайдера и введите ключ без пробелов и переносов строк (10–1024 символа)" });
    try {
      await saveProviderKey(parsed.data.provider, parsed.data.action === "save" ? parsed.data.key : null);
      resetOpenRouterModels();
      return { providers: await providerKeyStatuses() };
    } catch {
      throw new InternalServerErrorException({ error: "Не удалось сохранить настройки провайдера" });
    }
  }
}
