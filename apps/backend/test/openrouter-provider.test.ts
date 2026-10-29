import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";
import { getOpenRouterModels, OpenRouterProvider } from "@/lib/ai/openrouter-provider";
import type { CompanyGenerationInput } from "@/lib/domain/company";
import { safeErrorMessage } from "@/lib/http";

const sample = sampleCompanies[0];
const content = {
  brandName: sample.brandName,
  legalName: sample.legalName,
  contact: sample.contact,
  serviceType: sample.serviceType,
  size: sample.size,
  history: sample.history,
  specialisation: sample.specialisation,
  audience: sample.audience,
  customerProblem: sample.customerProblem,
  product: sample.product,
  faq: sample.faq.map(({ question, answer }) => ({ question, answer })),
  team: sample.team.map(({ name, role, bio }) => ({ name, role, bio })),
};
const input: CompanyGenerationInput = {
  brandName: sample.brandName,
  country: "DE",
  businessDirection: "b2b-ai-investment-research",
  serviceType: sample.serviceType,
  size: sample.size,
  provider: "openrouter",
  model: "openai/test-model",
  seed: "provider-test",
};
const descriptor = { id: "openai/test-model", label: "Test", inputUsdPerToken: 0.000001, outputUsdPerToken: 0.000002 };

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENROUTER_API_KEY;
});

describe("OpenRouter provider", () => {
  it("keeps only priced models that declare structured output support", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [
        {
          id: "vendor/structured",
          name: "Structured",
          pricing: { prompt: "0.000001", completion: "0.000002" },
          supported_parameters: ["structured_outputs"],
        },
        {
          id: "vendor/unknown",
          name: "Unknown capabilities",
          pricing: { prompt: "0.000001", completion: "0.000002" },
        },
        {
          id: "vendor/unpriced",
          name: "Unpriced",
          pricing: { prompt: "unknown", completion: "unknown" },
          supported_parameters: ["response_format"],
        },
        { id: "vendor/json-only", pricing: { prompt: "0", completion: "0" }, supported_parameters: ["response_format"] },
        { id: "vendor/negative", pricing: { prompt: "-1", completion: "0.001" }, supported_parameters: ["structured_outputs"] },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } })));

    await expect(getOpenRouterModels()).resolves.toEqual([
      {
        id: "vendor/structured",
        label: "Structured",
        inputUsdPerToken: 0.000001,
        outputUsdPerToken: 0.000002,
      },
    ]);
  });

  it("does not truncate a large catalogue at 200 models", async () => {
    vi.resetModules();
    const { getOpenRouterModels: freshCatalogue } = await import("@/lib/ai/openrouter-provider");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: Array.from({ length: 250 }, (_, i) => ({
      id: `vendor/model-${i}`, pricing: { prompt: "0.000001", completion: "0.000002" }, supported_parameters: ["structured_outputs"],
    })) }))));
    expect(await freshCatalogue()).toHaveLength(250);
  });

  it("parses a structured result and uses reported cost", async () => {
    process.env.OPENROUTER_API_KEY = "test-key-not-secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
      usage: { prompt_tokens: 120, completion_tokens: 900, cost: 0.0123 },
    }), { status: 200, headers: { "content-type": "application/json" } })));
    const result = await new OpenRouterProvider(descriptor).generateCompany(input, "test prompt");
    expect(result.profile.brandName).toBe(sample.brandName);
    expect(result.profile.generation).toMatchObject({ provider: "openrouter", model: descriptor.id });
    expect(result.usage).toEqual({ inputTokens: 120, outputTokens: 900, costUsd: 0.0123 });
  });

  it("rejects invalid JSON instead of saving partial content", async () => {
    process.env.OPENROUTER_API_KEY = "test-key-not-secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "not-json" } }] }), { status: 200 })));
    await expect(new OpenRouterProvider(descriptor).generateCompany(input, "test prompt")).rejects.toThrow();
  });

  it("redacts provider secrets from safe errors", () => {
    expect(safeErrorMessage(new Error("Bearer abc.def-123 and sk-example-secret"))).toBe("Bearer [REDACTED] and [REDACTED]");
  });
});
