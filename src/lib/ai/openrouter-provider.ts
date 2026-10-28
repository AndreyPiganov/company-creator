import { z } from "zod";
import type { CompanyGenerationInput } from "@/lib/domain/company";
import { generatedCompanyContentSchema } from "./content-schema";
import { MAX_OUTPUT_TOKENS, requestTimeout } from "./config";
import { createProfileFromContent } from "./profile";
import type { AiProvider, ModelDescriptor, ProviderResult } from "./types";

const openRouterModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      pricing: z.object({ prompt: z.string(), completion: z.string() }),
      supported_parameters: z.array(z.string()).optional(),
    }),
  ),
});

let cachedModels: { expiresAt: number; models: ModelDescriptor[] } | undefined;

export async function getOpenRouterModels(): Promise<ModelDescriptor[]> {
  if (cachedModels && cachedModels.expiresAt > Date.now()) return cachedModels.models;
  const headers: Record<string, string> = {};
  if (process.env.OPENROUTER_API_KEY) headers.authorization = `Bearer ${process.env.OPENROUTER_API_KEY}`;
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers,
    signal: AbortSignal.timeout(Math.min(requestTimeout(), 20_000)),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`OpenRouter model catalogue returned ${response.status}`);
  const parsed = openRouterModelsResponseSchema.parse(await response.json());
  const models = parsed.data
    .filter((item) => {
      const parameters = item.supported_parameters ?? [];
      return parameters.includes("structured_outputs") || parameters.includes("response_format");
    })
    .map((item) => ({
      id: item.id,
      label: item.name || item.id,
      inputUsdPerToken: Number(item.pricing.prompt),
      outputUsdPerToken: Number(item.pricing.completion),
    }))
    .filter((item) => Number.isFinite(item.inputUsdPerToken) && Number.isFinite(item.outputUsdPerToken))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 200);
  cachedModels = { expiresAt: Date.now() + 15 * 60_000, models };
  return models;
}

export class OpenRouterProvider implements AiProvider {
  readonly id = "openrouter" as const;

  constructor(readonly model: ModelDescriptor) {}

  estimateMaximumCost(prompt: string): number {
    const estimatedInputTokens = Math.ceil(prompt.length / 3);
    return estimatedInputTokens * this.model.inputUsdPerToken + MAX_OUTPUT_TOKENS * this.model.outputUsdPerToken;
  }

  async generateCompany(input: CompanyGenerationInput, prompt: string): Promise<ProviderResult> {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY не настроен на сервере");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "http-referer": process.env.APP_URL || "http://localhost:3000",
        "x-title": "Company Creator",
      },
      body: JSON.stringify({
        model: this.model.id,
        messages: [
          { role: "system", content: "You create internally consistent fictional company records and follow the supplied schema exactly." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "company_profile",
            strict: true,
            schema: z.toJSONSchema(generatedCompanyContentSchema),
          },
        },
        provider: { require_parameters: true },
        usage: { include: true },
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal: AbortSignal.timeout(requestTimeout()),
    });
    const payload = await response.json();
    if (!response.ok) {
      const message = typeof payload?.error?.message === "string" ? payload.error.message : `OpenRouter returned ${response.status}`;
      throw new Error(message);
    }
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenRouter не вернул структурированный профиль");
    const parsed = generatedCompanyContentSchema.parse(JSON.parse(content));
    const inputTokens = Number(payload?.usage?.prompt_tokens ?? 0);
    const outputTokens = Number(payload?.usage?.completion_tokens ?? 0);
    const reportedCost = Number(payload?.usage?.cost);
    const costUsd = Number.isFinite(reportedCost)
      ? reportedCost
      : inputTokens * this.model.inputUsdPerToken + outputTokens * this.model.outputUsdPerToken;
    return {
      profile: createProfileFromContent(parsed, input, this.id, this.model.id),
      usage: { inputTokens, outputTokens, costUsd },
    };
  }
}
