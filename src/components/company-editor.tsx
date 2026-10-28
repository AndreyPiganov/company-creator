"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check, Save, TriangleAlert } from "lucide-react";
import type { CompanyProfile } from "@/lib/domain/company";

type Notice = { type: "success" | "error"; text: string } | null;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]";
const textAreaClass = `${inputClass} min-h-28 resize-y leading-6`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--ink)]">
      {label}
      {children}
    </label>
  );
}

export function CompanyEditor({ company }: { company: CompanyProfile }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice>(null);
  const [approving, setApproving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CompanyProfile>({ defaultValues: company });

  const save = handleSubmit(async (values) => {
    setNotice(null);
    const response = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) {
      const detail = Array.isArray(payload.details)
        ? payload.details.map((item: { path?: string; message?: string }) => `${item.path}: ${item.message}`).join("; ")
        : payload.error;
      setNotice({ type: "error", text: detail || "Не удалось сохранить карточку" });
      return;
    }
    setNotice({ type: "success", text: "Изменения сохранены. Карточка возвращена в черновик." });
    router.refresh();
  });

  async function approve() {
    setApproving(true);
    setNotice(null);
    const response = await fetch(`/api/companies/${company.id}/approve`, { method: "POST" });
    const payload = await response.json();
    setApproving(false);
    if (!response.ok) {
      setNotice({ type: "error", text: payload.error || "Не удалось утвердить карточку" });
      return;
    }
    setNotice({ type: "success", text: "Карточка утверждена и готова к созданию сайта." });
    router.refresh();
  }

  const bilingualSections: Array<{
    title: string;
    path:
      | "history"
      | "specialisation"
      | "audience"
      | "customerProblem"
      | "product.summary"
      | "product.inputs"
      | "product.process"
      | "product.output"
      | "product.limitations";
  }> = [
    { title: "История", path: "history" },
    { title: "Специализация", path: "specialisation" },
    { title: "Целевая аудитория", path: "audience" },
    { title: "Проблема клиента", path: "customerProblem" },
    { title: "Описание продукта", path: "product.summary" },
    { title: "Входные данные", path: "product.inputs" },
    { title: "Процесс", path: "product.process" },
    { title: "Результат", path: "product.output" },
    { title: "Ограничения", path: "product.limitations" },
  ];

  return (
    <form onSubmit={save} className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            notice.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.type === "error" ? <TriangleAlert size={18} /> : <Check size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Основные сведения</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Бренд"><input className={inputClass} {...register("brandName")} /></Field>
          <Field label="Юридическое имя"><input className={inputClass} {...register("legalName")} /></Field>
          <Field label="Город">
            <select className={inputClass} {...register("contact.city")}>
              {['Berlin', 'München', 'Frankfurt am Main', 'Hamburg', 'Köln'].map((city) => <option key={city}>{city}</option>)}
            </select>
          </Field>
          <Field label="Адрес"><input className={inputClass} {...register("contact.address")} /></Field>
          <Field label="Телефон"><input className={inputClass} {...register("contact.phone")} /></Field>
          <Field label="Email"><input className={inputClass} type="email" {...register("contact.email")} /></Field>
          <Field label="Масштаб">
            <select className={inputClass} {...register("size")}>
              <option value="small">Небольшая</option><option value="medium">Средняя</option>
            </select>
          </Field>
          <Field label="Тип сервиса">
            <select className={inputClass} {...register("serviceType")}>
              <option value="investment-due-diligence">Investment due diligence</option>
              <option value="market-intelligence">Market intelligence</option>
              <option value="portfolio-monitoring">Мониторинг портфеля</option>
              <option value="document-data-analysis">Анализ документов</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Двуязычное содержание</h2>
        <div className="mt-6 space-y-7">
          <div>
            <h3 className="font-semibold">Название продукта</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Field label="Русский"><input className={inputClass} {...register("product.name.ru")} /></Field>
              <Field label="Deutsch"><input className={inputClass} {...register("product.name.de")} /></Field>
            </div>
          </div>
          {bilingualSections.map(({ title, path }) => (
            <div key={path}>
              <h3 className="font-semibold">{title}</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Field label="Русский"><textarea className={textAreaClass} {...register(`${path}.ru`)} /></Field>
                <Field label="Deutsch"><textarea className={textAreaClass} {...register(`${path}.de`)} /></Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Команда</h2>
        <div className="mt-5 space-y-6">
          {company.team.map((member, index) => (
            <fieldset key={member.id} className="rounded-xl border border-[var(--line)] p-4">
              <legend className="px-2 text-sm font-semibold">{index + 1}. {member.name}</legend>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Имя"><input className={inputClass} {...register(`team.${index}.name`)} /></Field>
                <span />
                <Field label="Должность — RU"><input className={inputClass} {...register(`team.${index}.role.ru`)} /></Field>
                <Field label="Position — DE"><input className={inputClass} {...register(`team.${index}.role.de`)} /></Field>
                <Field label="Биография — RU"><textarea className={textAreaClass} {...register(`team.${index}.bio.ru`)} /></Field>
                <Field label="Biografie — DE"><textarea className={textAreaClass} {...register(`team.${index}.bio.de`)} /></Field>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">FAQ</h2>
        <div className="mt-5 space-y-6">
          {company.faq.map((item, index) => (
            <fieldset key={item.id} className="rounded-xl border border-[var(--line)] p-4">
              <legend className="px-2 text-sm font-semibold">Вопрос {index + 1}</legend>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Вопрос — RU"><input className={inputClass} {...register(`faq.${index}.question.ru`)} /></Field>
                <Field label="Frage — DE"><input className={inputClass} {...register(`faq.${index}.question.de`)} /></Field>
                <Field label="Ответ — RU"><textarea className={textAreaClass} {...register(`faq.${index}.answer.ru`)} /></Field>
                <Field label="Antwort — DE"><textarea className={textAreaClass} {...register(`faq.${index}.answer.de`)} /></Field>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(255,253,248,.94)] p-4 shadow-lg backdrop-blur">
        <p className="text-sm text-[var(--muted)]">
          {isDirty ? "Есть несохранённые изменения" : `Ревизия ${company.revision}`}
        </p>
        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 font-semibold disabled:opacity-50">
            <Save size={17} /> {isSubmitting ? "Сохранение…" : "Сохранить"}
          </button>
          <button type="button" onClick={approve} disabled={approving || isDirty} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" title={isDirty ? "Сначала сохраните изменения" : undefined}>
            <Check size={17} /> {approving ? "Проверка…" : "Утвердить"}
          </button>
        </div>
      </div>
    </form>
  );
}
