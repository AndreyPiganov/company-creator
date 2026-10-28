import { beforeEach, describe, expect, it, vi } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";

const mocks = vi.hoisted(() => ({
  createAiProvider: vi.fn(),
  insertCompany: vi.fn(),
  updateJob: vi.fn(),
}));

vi.mock("@/lib/ai/factory", () => ({ createAiProvider: mocks.createAiProvider }));
vi.mock("@/lib/db/repository", () => ({ insertCompany: mocks.insertCompany, updateJob: mocks.updateJob }));

import { runCompanyGenerationJob } from "@/lib/generation/company-job";

const input = {
  brandName: "Test Brand",
  country: "DE" as const,
  businessDirection: "b2b-ai-investment-research" as const,
  serviceType: "market-intelligence" as const,
  size: "small" as const,
  provider: "openai" as const,
  model: "gpt-6-luna",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AI_OPERATION_BUDGET_USD = "0.25";
  process.env.AI_MAX_RETRIES = "1";
});

describe("company generation job", () => {
  it("retries once after an invalid provider response", async () => {
    const generateCompany = vi.fn()
      .mockRejectedValueOnce(new Error("invalid JSON"))
      .mockResolvedValueOnce({ profile: sampleCompanies[0], usage: { inputTokens: 100, outputTokens: 500, costUsd: 0.01 } });
    mocks.createAiProvider.mockResolvedValue({ estimateMaximumCost: () => 0.02, generateCompany });
    await runCompanyGenerationJob("job-retry", input);
    expect(generateCompany).toHaveBeenCalledTimes(2);
    expect(mocks.insertCompany).toHaveBeenCalledOnce();
    expect(mocks.updateJob).toHaveBeenCalledWith("job-retry", expect.objectContaining({ state: "retrying", attempt: 2 }));
    expect(mocks.updateJob).toHaveBeenLastCalledWith("job-retry", expect.objectContaining({ state: "complete" }));
  });

  it("blocks a request whose maximum estimate exceeds the budget", async () => {
    const generateCompany = vi.fn();
    mocks.createAiProvider.mockResolvedValue({ estimateMaximumCost: () => 0.3, generateCompany });
    await runCompanyGenerationJob("job-budget", input);
    expect(generateCompany).not.toHaveBeenCalled();
    expect(mocks.updateJob).toHaveBeenLastCalledWith("job-budget", expect.objectContaining({ state: "failed" }));
  });
});
