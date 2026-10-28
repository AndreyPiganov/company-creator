import { NextResponse } from "next/server";
import { approveCompany } from "@/lib/db/repository";
import { apiError, safeErrorMessage } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const company = await approveCompany(id);
    return company ? NextResponse.json({ company }) : apiError("Компания не найдена", 404);
  } catch (error) {
    return apiError("Не удалось утвердить карточку", 422, safeErrorMessage(error));
  }
}
