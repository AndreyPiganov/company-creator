import { NextResponse } from "next/server";
import { getJob } from "@/lib/db/repository";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) return apiError("Задача не найдена", 404);
  const { input, ...publicJob } = job;
  void input;
  return NextResponse.json({ job: publicJob });
}
