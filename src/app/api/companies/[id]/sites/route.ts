import { NextResponse } from "next/server";
import { createJob, getCompany, listSiteVersions } from "@/lib/db/repository";
import { siteGenerationInputSchema } from "@/lib/domain/company";
import { runSiteGenerationJob } from "@/lib/generation/site-job";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json({ sites: await listSiteVersions(id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const company = await getCompany(id);
  if (!company) return apiError("Компания не найдена", 404);
  if (company.status !== "approved") return apiError("Сначала утвердите карточку компании", 409);
  const parsed = siteGenerationInputSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Некорректные параметры сайта", 422, parsed.error.issues);
  const job = await createJob("site", { companyId: id, ...parsed.data });
  setTimeout(() => void runSiteGenerationJob(job.id, id, parsed.data), 0);
  const { input: _input, ...publicJob } = job;
  return NextResponse.json({ job: publicJob }, { status: 202 });
}
