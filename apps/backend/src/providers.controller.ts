import { Controller, Get } from "@nestjs/common";
import { MAX_OUTPUT_TOKENS, OPENAI_MODELS, operationBudget } from "./lib/ai/config";
import type { ModelDescriptor } from "./lib/ai/types";
import { getOpenRouterModels } from "./lib/ai/openrouter-provider";
import { getProviderKey } from "./lib/settings/provider-keys";

@Controller()
export class ProvidersController {
  @Get("api/providers")
  async providers() {
    const budget = operationBudget();
    const [openAiKey, openRouterKey] = await Promise.all([getProviderKey("openai"), getProviderKey("openrouter")]);
    const describe = (model: ModelDescriptor) => ({
      id: model.id, label: model.label,
      inputUsdPerMillion: model.inputUsdPerToken * 1_000_000,
      outputUsdPerMillion: model.outputUsdPerToken * 1_000_000,
      outputReserveUsd: MAX_OUTPUT_TOKENS * model.outputUsdPerToken,
      exceedsBudget: MAX_OUTPUT_TOKENS * model.outputUsdPerToken > budget,
    });
    let openRouterModels: ReturnType<typeof describe>[] = [];
    let openRouterError: string | null = null;
    if (openRouterKey) {
      try {
        openRouterModels = (await getOpenRouterModels()).map(describe);
      } catch {
        openRouterError = "Не удалось загрузить каталог моделей";
      }
    }
    return {
      budgetUsd: budget,
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
          configured: Boolean(openAiKey),
          models: OPENAI_MODELS.map(describe),
        },
        {
          id: "openrouter",
          label: "OpenRouter",
          configured: Boolean(openRouterKey),
          models: openRouterModels,
          error: openRouterError,
        },
      ],
    };
  }
}
