import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { CompanyGenerationInput } from "../domain/company";
import { generatedCompanyContentSchema } from "./content-schema";
import { MAX_OUTPUT_TOKENS, requestTimeout } from "./config";
import { createProfileFromContent } from "./profile";
import type { AiProvider, ModelDescriptor, ProviderResult } from "./types";

export class OpenAiProvider implements AiProvider {
  readonly id = "openai" as const;

  constructor(readonly model: ModelDescriptor) {}

  estimateMaximumCost(prompt: string): number {
    const estimatedInputTokens = Math.ceil(prompt.length / 3);
    return estimatedInputTokens * this.model.inputUsdPerToken + MAX_OUTPUT_TOKENS * this.model.outputUsdPerToken;
  }

  async generateCompany(input: CompanyGenerationInput, prompt: string): Promise<ProviderResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY не настроен на сервере");
    const client = new OpenAI({ apiKey: key, timeout: requestTimeout(), maxRetries: 0 });
    const response = await client.responses.parse({
      model: this.model.id,
      input: [
        { role: "system", content: "You create internally consistent fictional company records and follow the supplied schema exactly." },
        { role: "user", content: prompt },
      ],
      max_output_tokens: MAX_OUTPUT_TOKENS,
      text: { format: zodTextFormat(generatedCompanyContentSchema, "company_profile") },
    });
    if (!response.output_parsed) throw new Error("OpenAI не вернул структурированный профиль");
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    return {
      profile: createProfileFromContent(response.output_parsed, input, this.id, this.model.id),
      usage: {
        inputTokens,
        outputTokens,
        costUsd: inputTokens * this.model.inputUsdPerToken + outputTokens * this.model.outputUsdPerToken,
      },
    };
  }
}
