import { GenerationForm } from "@/components/generation-form";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Этап A</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Новая компания</h1><p className="mt-4 text-lg leading-8 text-[var(--muted)]">Задайте исходные параметры. Результат сохранится как двуязычный черновик, который можно проверить и утвердить.</p></div>
      <div className="mt-9"><GenerationForm /></div>
    </div>
  );
}
