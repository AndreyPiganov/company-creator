import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
      <section className="grid items-end gap-12 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Company → Website
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Сначала факты. Потом сайт, который им не противоречит.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Создайте двуязычную карточку вымышленной B2B-компании, утвердите её и соберите неизменяемую версию статического сайта.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/companies/new" className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white">
              Начать генерацию <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/companies" className="inline-flex items-center rounded-xl border border-[var(--line)] bg-white px-5 py-3 font-semibold">
              Открыть примеры
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_22px_60px_rgba(31,41,36,.08)]">
          <p className="text-sm font-semibold text-[var(--muted)]">Процесс</p>
          <ol className="mt-5 space-y-5">
            {["Параметры и генерация", "Проверка и утверждение", "Версионный сайт и ZIP"].map((item, index) => (
              <li key={item} className="flex items-center gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent)]">{index + 1}</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mt-20 grid gap-4 md:grid-cols-3">
        {[
          [Layers3, "Единый источник", "Все страницы собираются из утверждённого JSON-профиля."],
          [CheckCircle2, "RU + DE", "Оба языка хранятся вместе и проходят одинаковую проверку."],
          [ShieldCheck, "Ключи на сервере", "Секреты не попадают в браузер, экспорт или журналы."],
        ].map(([Icon, title, text]) => {
          const CardIcon = Icon as typeof Layers3;
          return (
            <article key={String(title)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <CardIcon className="text-[var(--accent)]" aria-hidden="true" />
              <h2 className="mt-8 text-xl font-semibold tracking-[-0.025em]">{String(title)}</h2>
              <p className="mt-2 leading-7 text-[var(--muted)]">{String(text)}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
