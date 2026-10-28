import { NextResponse } from "next/server";
import { companyGenerationInputSchema } from "@/lib/domain/company";
import { createJob } from "@/lib/db/repository";
import { runCompanyGenerationJob } from "@/lib/generation/company-job";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = companyGenerationInputSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Некорректные параметры генерации", 422, parsed.error.issues);
  const job = await createJob("company", parsed.data);
  setTimeout(() => void runCompanyGenerationJob(job.id, parsed.data), 0);
  const { input, ...publicJob } = job;
  void input;
  return NextResponse.json({ job: publicJob }, { status: 202 });
}
