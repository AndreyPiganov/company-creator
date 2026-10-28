import type { CompanyGenerationInput } from "@/lib/domain/company";
import { assertValidCompany } from "@/lib/domain/validate";
import { createAiProvider } from "@/lib/ai/factory";
import { maxRetries, operationBudget } from "@/lib/ai/config";
import { buildCompanyPrompt } from "@/lib/ai/prompt";
import { insertCompany, updateJob } from "@/lib/db/repository";
import { safeErrorMessage } from "@/lib/http";
import { generateOfflineCompany } from "./offline";

export async function runCompanyGenerationJob(jobId: string, input: CompanyGenerationInput): Promise<void> {
  let spent = 0;
  try {
    await updateJob(jobId, { state: "preparing", attempt: 0, costUsd: 0, error: null });
    if (input.provider === "offline") {
      const profile = generateOfflineCompany(input);
      await updateJob(jobId, { state: "validating", attempt: 1, costUsd: 0 });
      assertValidCompany(profile);
      await updateJob(jobId, { state: "saving" });
      await insertCompany(profile);
      await updateJob(jobId, { state: "complete", resultId: profile.id, costUsd: 0, error: null });
      return;
    }
    const provider = await createAiProvider(input);
    const prompt = buildCompanyPrompt(input);
    const estimate = provider.estimateMaximumCost(prompt);
    const budget = operationBudget();
    if (estimate > budget) {
      throw new Error(`Максимальная оценка $${estimate.toFixed(4)} превышает лимит $${budget.toFixed(2)}`);
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries(); attempt += 1) {
      if (attempt > 0) await updateJob(jobId, { state: "retrying", attempt: attempt + 1, costUsd: spent });
      if (spent + estimate > budget && attempt > 0) throw new Error("Повторная попытка превысит оставшийся бюджет операции");
      try {
        await updateJob(jobId, { state: "requesting", attempt: attempt + 1, costUsd: spent });
        const result = await provider.generateCompany(input, prompt);
        spent += result.usage.costUsd;
        if (spent > budget) throw new Error("Провайдер сообщил стоимость выше лимита операции");
        await updateJob(jobId, { state: "validating", costUsd: spent });
        const profile = assertValidCompany(result.profile);
        await updateJob(jobId, { state: "saving", costUsd: spent });
        await insertCompany(profile);
        await updateJob(jobId, { state: "complete", resultId: profile.id, costUsd: spent, error: null });
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  } catch (error) {
    await updateJob(jobId, { state: "failed", costUsd: spent, error: safeErrorMessage(error) });
  }
}
