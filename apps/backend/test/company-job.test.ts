import { beforeEach, describe, expect, it, vi } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";
import { GenerationService } from "@/generation/generation.service";

const mocks = vi.hoisted(() => ({
  createAiProvider: vi.fn(),
}));

vi.mock("@/lib/ai/factory", () => ({ createAiProvider: mocks.createAiProvider }));

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
    const repository = {
      createJob: vi.fn().mockResolvedValue({ id: "job-retry" }),
      updateJob: vi.fn().mockResolvedValue(undefined),
      insertCompany: vi.fn().mockResolvedValue(sampleCompanies[0]),
    };
    const generateCompany = vi.fn()
      .mockRejectedValueOnce(new Error("invalid JSON"))
      .mockResolvedValueOnce({ profile: sampleCompanies[0], usage: { inputTokens: 100, outputTokens: 500, costUsd: 0.01 } });
    mocks.createAiProvider.mockResolvedValue({ estimateMaximumCost: () => 0.02, generateCompany });
    const service = new GenerationService(repository as never);
    await service.enqueue(input);
    await vi.waitFor(() => expect(repository.updateJob).toHaveBeenCalledWith("job-retry", expect.objectContaining({ state: "complete" })));
    expect(generateCompany).toHaveBeenCalledTimes(2);
    expect(repository.insertCompany).toHaveBeenCalledOnce();
    expect(repository.updateJob).toHaveBeenCalledWith("job-retry", expect.objectContaining({ state: "retrying", attempt: 2 }));
  });

  it("blocks a request whose maximum estimate exceeds the budget", async () => {
    const repository = {
      createJob: vi.fn().mockResolvedValue({ id: "job-budget" }),
      updateJob: vi.fn().mockResolvedValue(undefined),
      insertCompany: vi.fn(),
    };
    const generateCompany = vi.fn();
    mocks.createAiProvider.mockResolvedValue({ estimateMaximumCost: () => 0.3, generateCompany });
    const service = new GenerationService(repository as never);
    await service.enqueue(input);
    await vi.waitFor(() => expect(repository.updateJob).toHaveBeenCalledWith("job-budget", expect.objectContaining({ state: "failed" })));
    expect(generateCompany).not.toHaveBeenCalled();
  });
});
