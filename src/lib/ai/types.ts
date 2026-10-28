import type { CompanyGenerationInput, CompanyProfile } from "@/lib/domain/company";

export type ProviderId = "openai" | "openrouter";

export type ModelDescriptor = {
  id: string;
  label: string;
  inputUsdPerToken: number;
  outputUsdPerToken: number;
};

export type ProviderUsage = {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

export type ProviderResult = {
  profile: CompanyProfile;
  usage: ProviderUsage;
};

export interface AiProvider {
  readonly id: ProviderId;
  readonly model: ModelDescriptor;
  estimateMaximumCost(prompt: string): number;
  generateCompany(input: CompanyGenerationInput, prompt: string): Promise<ProviderResult>;
}
