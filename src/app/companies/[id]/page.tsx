import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, Globe2 } from "lucide-react";
import { getCompany, listSiteVersions } from "@/lib/db/repository";
import { ensureSeedData } from "@/lib/db/seed";
import { CompanyEditor } from "@/components/company-editor";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureSeedData();
  const { id } = await params;
  const [company, sites] = await Promise.all([getCompany(id), listSiteVersions(id)]);
  if (!company) notFound();
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><div className="flex items-center gap-3"><p className="text-sm font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Карточка компании</p><StatusBadge status={company.status} /></div><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{company.brandName}</h1><p className="mt-2 text-[var(--muted)]">{company.legalName} · {company.contact.city}</p></div>
        <div className="flex flex-wrap gap-2"><a href={`/api/companies/${id}/export`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 font-semibold"><Download size={17} /> JSON</a><Link href="#sites" className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 font-semibold text-white"><Globe2 size={17} /> Версии сайта</Link></div>
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CompanyEditor company={company} />
        <aside id="sites" className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><p className="text-xs font-semibold uppercase tracking-[.13em] text-[var(--accent)]">Этап B</p><h2 className="mt-2 text-xl font-semibold">Версии сайта</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{company.status === "approved" ? "Карточка утверждена — можно создать неизменяемый сайт." : "Сначала сохраните и утвердите карточку."}</p><Link href={`/companies/${id}/sites/new`} aria-disabled={company.status !== "approved"} className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 font-semibold ${company.status === "approved" ? "bg-[var(--accent)] text-white" : "pointer-events-none bg-stone-200 text-stone-500"}`}>Создать сайт</Link></div>
          {sites.map((site) => <div key={site.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><strong>Версия {site.version}</strong><span className="rounded-full bg-stone-100 px-2 py-1 text-xs uppercase">{site.language}</span></div><p className="mt-2 text-sm text-[var(--muted)]">Тема: {site.theme}</p><div className="mt-4 flex flex-wrap gap-3"><Link href={`/sites/${site.id}/preview/index.html`} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">Предпросмотр <ExternalLink size={14} /></Link><a href={`/api/sites/${site.id}/download`} className="inline-flex items-center gap-1 text-sm font-semibold"><Download size={14} /> ZIP</a></div></div>)}
          {sites.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--line)] p-5 text-sm leading-6 text-[var(--muted)]">Версий пока нет. Ранее созданные сайты появятся здесь и не изменятся после редактирования карточки.</div>}
        </aside>
      </div>
    </div>
  );
}
