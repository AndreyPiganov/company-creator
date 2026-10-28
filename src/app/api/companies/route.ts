import { NextResponse } from "next/server";
import { insertCompany, listCompanies } from "@/lib/db/repository";
import { ensureSeedData } from "@/lib/db/seed";
import { apiError, safeErrorMessage } from "@/lib/http";
import { assertValidCompany } from "@/lib/domain/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeedData();
  return NextResponse.json({ companies: await listCompanies() });
}

export async function POST(request: Request) {
  try {
    const profile = assertValidCompany(await request.json());
    await insertCompany(profile);
    return NextResponse.json({ company: profile }, { status: 201 });
  } catch (error) {
    return apiError("Не удалось сохранить компанию", 422, safeErrorMessage(error));
  }
}
