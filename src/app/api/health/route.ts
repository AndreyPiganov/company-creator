import { NextResponse } from "next/server";
import { ensureSeedData } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeedData();
  return NextResponse.json({ status: "ok", database: "ready" });
}
