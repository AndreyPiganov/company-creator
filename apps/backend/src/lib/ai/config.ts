import type { ModelDescriptor } from "./types";

export const OPENAI_MODELS: ModelDescriptor[] = [
  {
    id: "gpt-6-luna",
    label: "GPT-6 Luna",
    inputUsdPerToken: 0.1 / 1_000_000,
    outputUsdPerToken: 0.5 / 1_000_000,
  },
  { id: "gpt-6-sol", label: "GPT-6 Sol", inputUsdPerToken: 2 / 1_000_000, outputUsdPerToken: 10 / 1_000_000 },
  { id: "gpt-6.1-sol", label: "GPT-6.1 Sol", inputUsdPerToken: 2 / 1_000_000, outputUsdPerToken: 10 / 1_000_000 },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", inputUsdPerToken: 0.4 / 1_000_000, outputUsdPerToken: 1.6 / 1_000_000 },
  { id: "gpt-4.1", label: "GPT-4.1", inputUsdPerToken: 2 / 1_000_000, outputUsdPerToken: 8 / 1_000_000 },
  { id: "gpt-6-astra", label: "GPT-6 Astra", inputUsdPerToken: 10 / 1_000_000, outputUsdPerToken: 50 / 1_000_000 },
];

export const MAX_OUTPUT_TOKENS = 8_000;

export function operationBudget(): number {
  const parsed = Number(process.env.AI_OPERATION_BUDGET_USD ?? "0.25");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.25;
}

export function maxRetries(): number {
  const parsed = Number.parseInt(process.env.AI_MAX_RETRIES ?? "1", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
}

export function requestTimeout(): number {
  const parsed = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? "90000", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 5_000), 180_000) : 90_000;
}
