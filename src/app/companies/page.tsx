import Link from "next/link";
import { ArrowRight, Building2, Globe2, MapPin, Plus } from "lucide-react";
import { ensureSeedData } from "@/lib/db/seed";
import { listCompanies } from "@/lib/db/repository";
import { SERVICE_LABELS, SIZE_LABELS } from "@/lib/domain/catalogues";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  await ensureSeedData();
  const companies = await listCompanies();
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Библиотека</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Компании и сайты</h1><p className="mt-3 text-[var(--muted)]">Карточка — источник фактов. Сайт — неизменяемый снимок утверждённой ревизии.</p></div>
        <Link href="/companies/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 font-semibold text-white"><Plus size={18} /> Новая компания</Link>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {companies.map((company) => (
          <Link key={company.id} href={`/companies/${company.id}`} className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(30,43,37,.08)]">
            <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Building2 size={20} /></span><StatusBadge status={company.status} /></div>
            <h2 className="mt-6 text-2xl font-semibold tracking-[-.035em]">{company.brandName}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{company.legalName}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]"><span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {company.city}</span><span className="inline-flex items-center gap-1.5"><Globe2 size={15} /> {SERVICE_LABELS[company.serviceType].ru}</span><span>{SIZE_LABELS[company.size].ru}</span></div>
            <div className="mt-7 flex items-center justify-between border-t border-[var(--line)] pt-4 text-sm"><span className="text-[var(--muted)]">Ревизия {company.revision} · сайтов {company.siteCount}</span><span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">Открыть <ArrowRight className="transition group-hover:translate-x-1" size={16} /></span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
