import { notFound, redirect } from "next/navigation";
import { SiteGenerationForm } from "@/components/site-generation-form";
import { apiGet, ApiResponseError } from "@/lib/api";
import type { CompanyProfile } from "@/lib/domain/company";

export const dynamic = "force-dynamic";

export default async function NewSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let company: CompanyProfile;
  try {
    ({ company } = await apiGet<{ company: CompanyProfile }>(`/api/companies/${id}`));
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 404) notFound();
    throw error;
  }
  if (company.status !== "approved") redirect(`/companies/${id}`);
  return <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Этап B</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Сайт для {company.brandName}</h1><p className="mt-4 text-lg leading-8 text-[var(--muted)]">Будет сохранён снимок ревизии {company.revision}. Дальнейшие изменения карточки не затронут эту версию.</p></div><div className="mt-9"><SiteGenerationForm companyId={id} /></div></div>;
}
