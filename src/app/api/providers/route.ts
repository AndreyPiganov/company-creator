import { NextResponse } from "next/server";
import { OPENAI_MODELS, operationBudget } from "@/lib/ai/config";
import { getOpenRouterModels } from "@/lib/ai/openrouter-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  let openRouterModels: Array<{ id: string; label: string }> = [];
  let openRouterError: string | null = null;
  if (process.env.OPENROUTER_API_KEY) {
    try {
      openRouterModels = (await getOpenRouterModels()).map(({ id, label }) => ({ id, label }));
    } catch {
      openRouterError = "Не удалось загрузить каталог моделей";
    }
  }
  return NextResponse.json({
    budgetUsd: operationBudget(),
    providers: [
      { id: "offline", label: "Локальный генератор", configured: true, models: [{ id: "offline", label: "Offline" }] },
      {
        id: "openai",
        label: "OpenAI",
        configured: Boolean(process.env.OPENAI_API_KEY),
        models: OPENAI_MODELS.map(({ id, label }) => ({ id, label })),
      },
      {
        id: "openrouter",
        label: "OpenRouter",
        configured: Boolean(process.env.OPENROUTER_API_KEY),
        models: openRouterModels,
        error: openRouterError,
      },
    ],
  });
}
