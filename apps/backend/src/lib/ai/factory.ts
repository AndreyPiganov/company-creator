import type { CompanyGenerationInput } from "../domain/company";
import { OPENAI_MODELS } from "./config";
import { OpenAiProvider } from "./openai-provider";
import { getOpenRouterModels, OpenRouterProvider } from "./openrouter-provider";
import type { AiProvider } from "./types";
import { getProviderKey } from "../settings/provider-keys";

export async function createAiProvider(input: CompanyGenerationInput): Promise<AiProvider> {
  if (input.provider === "openai") {
    if (!await getProviderKey("openai")) throw new Error("OpenAI: добавьте ключ в настройках панели");
    const requested = input.model || process.env.OPENAI_MODEL || "gpt-6-luna";
    const model = OPENAI_MODELS.find((candidate) => candidate.id === requested);
    if (!model) throw new Error(`Модель OpenAI ${requested} не входит в серверный каталог с известной стоимостью`);
    return new OpenAiProvider(model);
  }
  if (input.provider === "openrouter") {
    if (!await getProviderKey("openrouter")) throw new Error("OpenRouter: добавьте ключ в настройках панели");
    const requested = input.model || process.env.OPENROUTER_DEFAULT_MODEL;
    if (!requested) throw new Error("Выберите модель OpenRouter");
    const models = await getOpenRouterModels();
    const model = models.find((candidate) => candidate.id === requested);
    if (!model) throw new Error(`Модель OpenRouter ${requested} недоступна или не сообщает стоимость`);
    return new OpenRouterProvider(model);
  }
  throw new Error("Локальный генератор будет доступен после инициализации offline-модуля");
}
