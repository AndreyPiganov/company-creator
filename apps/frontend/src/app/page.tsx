import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Layers3, Sparkles } from "lucide-react";

export default function HomePage() {
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
    <section className="studio-hero grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--accent)]"><Sparkles size={14} /> От идеи до готового сайта</p>
        <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">Новая компания.<br /><span className="text-[var(--accent)]">Своя история.<br />Готовый сайт.</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">Создайте вымышленную B2B-компанию с продуктом и командой. Проверьте её историю — и превратите карточку в сайт на русском или немецком.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><Link href="/companies/new" className="primary-button">Создать компанию <ArrowRight size={18} /></Link><Link href="/companies" className="font-semibold text-[var(--accent)]">Посмотреть примеры ↗</Link></div>
        <p className="mt-6 text-sm text-[var(--muted)]">Два языка · Четыре палитры · Готовый ZIP</p>
      </div>
      <div className="studio-preview" aria-label="Иллюстрация этапов работы">
        <div className="studio-preview-top"><i /><i /><i /><span className="ml-3 text-xs text-[var(--muted)]">Ваша следующая компания</span></div>
        <div className="p-7 sm:p-9">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Компания → сайт</span><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent)]">RU / DE</span></div>
          <div className="my-8"><div className="h-4 w-3/4 rounded bg-[#dae8e0]" /><div className="mt-3 h-4 w-1/2 rounded bg-[#dae8e0]" /><div className="mt-6 h-2 w-full rounded bg-[#eef3ef]" /><div className="mt-2 h-2 w-4/5 rounded bg-[#eef3ef]" /></div>
          <div className="grid grid-cols-3 gap-3">{["История", "Продукт", "Команда"].map((label, i) => <div key={label} className="rounded-xl border border-[var(--line)] p-3"><span className="text-xs text-[var(--muted)]">0{i + 1}</span><p className="mt-3 text-sm font-semibold">{label}</p></div>)}</div>
          <div className="mt-7 flex items-center gap-3 rounded-xl bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent)]"><FileCheck2 size={22} /> Утверждённая карточка — основа каждой страницы</div>
        </div>
      </div>
    </section>
    <div className="mb-6 mt-12 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold tracking-tight">Три шага к готовому сайту</h2><span className="text-sm text-[var(--muted)]">Вы контролируете каждый этап</span></div>
    <section className="grid gap-5 md:grid-cols-3">{[
      { icon: Sparkles, title: "Создайте компанию", text: "Выберите направление и масштаб. AI или локальный генератор подготовит историю, команду и продукт." },
      { icon: Check, title: "Проверьте детали", text: "Отредактируйте русскую и немецкую версии, проверьте факты и утвердите карточку." },
      { icon: Layers3, title: "Соберите сайт", text: "Выберите палитру и язык, откройте результат и скачайте три готовые страницы в архиве." },
    ].map(({ icon: Icon, title, text }, index) => <article key={title} className="studio-step"><div className="flex items-center justify-between"><Icon className="text-[var(--accent)]" size={23} /><span className="text-sm text-[var(--muted)]">0{index + 1}</span></div><h3 className="mb-3 mt-6 text-xl font-semibold">{title}</h3><p className="text-sm leading-7 text-[var(--muted)]">{text}</p></article>)}</section>
    <p className="mt-8 text-center text-xs leading-6 text-[var(--muted)]">Компании и их сотрудники вымышлены. Созданные сайты используют только утверждённые проектные данные.</p>
  </div>;
}
