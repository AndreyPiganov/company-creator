import { afterEach, describe, expect, it, vi } from "vitest";

const { constructorMock, parseMock } = vi.hoisted(() => ({
  constructorMock: vi.fn(),
  parseMock: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = { parse: parseMock };

    constructor(options: unknown) {
      constructorMock(options);
    }
  },
}));

vi.mock("openai/helpers/zod", () => ({
  zodTextFormat: vi.fn(() => ({ type: "json_schema", name: "company_profile" })),
}));

import { OpenAiProvider } from "@/lib/ai/openai-provider";
import type { CompanyGenerationInput } from "@/lib/domain/company";
import { sampleCompanies } from "@/lib/generation/samples";

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
  provider: "openai",
  model: "gpt-6-luna",
  seed: "openai-provider-test",
};
const descriptor = {
  id: "gpt-6-luna",
  label: "GPT-6 Luna",
  inputUsdPerToken: 0.1 / 1_000_000,
  outputUsdPerToken: 0.5 / 1_000_000,
};

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.OPENAI_API_KEY;
});

describe("OpenAI provider", () => {
  it("uses Responses Structured Outputs and accounts for token cost", async () => {
    process.env.OPENAI_API_KEY = "test-key-not-secret";
    parseMock.mockResolvedValue({
      output_parsed: content,
      usage: { input_tokens: 250, output_tokens: 1_200 },
    });

    const result = await new OpenAiProvider(descriptor).generateCompany(input, "test prompt");

    expect(constructorMock).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: "test-key-not-secret",
      maxRetries: 0,
    }));
    expect(parseMock).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-6-luna",
      max_output_tokens: 8_000,
    }));
    expect(result.profile.generation).toMatchObject({ provider: "openai", model: "gpt-6-luna" });
    expect(result.usage).toMatchObject({ inputTokens: 250, outputTokens: 1_200 });
    expect(result.usage.costUsd).toBeCloseTo(0.000625, 10);
  });

  it("does not persist an empty structured response", async () => {
    process.env.OPENAI_API_KEY = "test-key-not-secret";
    parseMock.mockResolvedValue({ output_parsed: null, usage: null });

    await expect(new OpenAiProvider(descriptor).generateCompany(input, "test prompt")).rejects.toThrow(
      "OpenAI не вернул структурированный профиль",
    );
  });
});
