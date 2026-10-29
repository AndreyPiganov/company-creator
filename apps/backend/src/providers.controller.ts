import { Controller, Get } from "@nestjs/common";
import { OPENAI_MODELS, operationBudget } from "./lib/ai/config";
import { getOpenRouterModels } from "./lib/ai/openrouter-provider";

@Controller()
export class ProvidersController {
  @Get("api/providers")
  async providers() {
    let openRouterModels: Array<{ id: string; label: string }> = [];
    let openRouterError: string | null = null;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        openRouterModels = (await getOpenRouterModels()).map(({ id, label }) => ({ id, label }));
      } catch {
        openRouterError = "Не удалось загрузить каталог моделей";
      }
    }
    return {
      budgetUsd: operationBudget(),
      providers: [
        {
          id: "offline",
          label: "Локальный генератор",
          configured: true,
          models: [{ id: "offline", label: "Offline" }],
        },
        {
          id: "openai",
          label: "OpenAI",
          configured: Boolean(process.env.OPENAI_API_KEY),
          models: OPENAI_MODELS.map(({ id, label }) => ({ id, label })),
        },
        {
          id: "openrouter",
          label: "OpenRouter",
          configured: Boolean(process.env.OPENROUTER_API_KEY),
          models: openRouterModels,
          error: openRouterError,
        },
      ],
    };
  }
}
