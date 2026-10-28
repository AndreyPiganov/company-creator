import { NextResponse } from "next/server";
import { getCompany, updateCompany } from "@/lib/db/repository";
import { ensureSeedData } from "@/lib/db/seed";
import { apiError, safeErrorMessage } from "@/lib/http";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await ensureSeedData();
  const { id } = await context.params;
  const company = await getCompany(id);
  return company ? NextResponse.json({ company }) : apiError("Компания не найдена", 404);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const company = await updateCompany(id, await request.json());
    return company ? NextResponse.json({ company }) : apiError("Компания не найдена", 404);
  } catch (error) {
    const issues = (error as Error & { issues?: unknown }).issues;
    return apiError("Карточка не прошла проверку", 422, issues ?? safeErrorMessage(error));
  }
}
