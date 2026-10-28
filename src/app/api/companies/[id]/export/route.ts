import { getCompany } from "@/lib/db/repository";
import { ensureSeedData } from "@/lib/db/seed";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

function fileName(brand: string) {
  const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company";
  return `${slug}.json`;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSeedData();
  const { id } = await context.params;
  const company = await getCompany(id);
  if (!company) return apiError("Компания не найдена", 404);
  return new Response(`${JSON.stringify(company, null, 2)}\n`, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName(company.brandName)}"`,
      "cache-control": "no-store",
    },
  });
}
