import { describe, expect, it, vi } from "vitest";
import { ProvidersController } from "@/providers.controller";
import { OPENAI_MODELS } from "@/lib/ai/config";

describe("public model catalogue", () => {
  it("offers priced choices and marks models that cannot fit the budget without exposing keys", async () => {
    vi.stubEnv("OPENAI_API_KEY", "private-test-value");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubEnv("AI_OPERATION_BUDGET_USD", "0.25");
    try {
      const result = await new ProvidersController().providers();
      const models = result.providers.find((provider) => provider.id === "openai")!.models;
      expect(models.length).toBeGreaterThan(1);
      expect(models).toContainEqual(expect.objectContaining({ id: "gpt-6-astra", exceedsBudget: true }));
      expect(models).toContainEqual(expect.objectContaining({ id: "gpt-6-luna", exceedsBudget: false }));
      for (const model of OPENAI_MODELS) {
        expect(model.inputUsdPerToken).toBeGreaterThanOrEqual(0);
        expect(model.outputUsdPerToken).toBeGreaterThan(0);
      }
      expect(JSON.stringify(result)).not.toContain("private-test-value");
    } finally { vi.unstubAllEnvs(); }
  });
});
