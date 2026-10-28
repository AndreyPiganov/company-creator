"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";

type Job = {
  id: string;
  state: string;
  attempt: number;
  costUsd: number;
  resultId: string | null;
  error: string | null;
};

const control = "mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--accent)]";

export function GenerationForm() {
  const router = useRouter();
  const [provider, setProvider] = useState("offline");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  async function poll(id: string) {
    const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Не удалось получить статус задачи");
      return;
    }
    setJob(payload.job);
    if (payload.job.state === "complete" && payload.job.resultId) {
      router.push(`/companies/${payload.job.resultId}`);
      return;
    }
    if (payload.job.state === "failed") {
      setError(payload.job.error || "Генерация завершилась ошибкой");
      return;
    }
    pollRef.current = setTimeout(() => poll(id), 750);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/generation/companies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        brandName: form.get("brandName"),
        country: "DE",
        businessDirection: "b2b-ai-investment-research",
        serviceType: form.get("serviceType"),
        size: form.get("size"),
        provider,
        model: provider === "offline" ? undefined : form.get("model"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Не удалось запустить генерацию");
      return;
    }
    setJob(payload.job);
    await poll(payload.job.id);
  }

  const busy = job && !["complete", "failed"].includes(job.state);

  return (
    <form onSubmit={submit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(24,32,29,.08)] sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium">Название бренда <span className="text-[var(--muted)]">(пусто = случайное)</span><input name="brandName" maxLength={80} className={control} placeholder="Например, Nordlicht Research" /></label>
        <label className="text-sm font-medium">Масштаб<select name="size" className={control} defaultValue="random"><option value="random">Случайный</option><option value="small">Небольшая</option><option value="medium">Средняя</option></select></label>
        <label className="text-sm font-medium">Тип сервиса<select name="serviceType" className={control} defaultValue="random"><option value="random">Случайный</option><option value="investment-due-diligence">Investment due diligence</option><option value="market-intelligence">Market intelligence</option><option value="portfolio-monitoring">Мониторинг портфеля</option><option value="document-data-analysis">Анализ документов</option></select></label>
        <label className="text-sm font-medium">Провайдер<select name="provider" value={provider} onChange={(event) => setProvider(event.target.value)} className={control}><option value="offline">Локальный — без API</option><option value="openai">OpenAI</option><option value="openrouter">OpenRouter</option></select></label>
        {provider !== "offline" && <label className="text-sm font-medium md:col-span-2">Модель<input name="model" className={control} defaultValue={provider === "openai" ? "gpt-6-luna" : ""} placeholder={provider === "openrouter" ? "Выберите доступную модель" : "gpt-6-luna"} /></label>}
      </div>
      {job && busy && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent)]" role="status">
          <LoaderCircle className="animate-spin" size={19} />
          <span>Этап: <strong>{job.state}</strong>{job.attempt > 0 ? ` · попытка ${job.attempt}` : ""}</span>
        </div>
      )}
      {error && <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><TriangleAlert size={18} /><span>{error}</span></div>}
      <button disabled={Boolean(busy)} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {busy ? "Генерация…" : "Создать карточку"}
      </button>
      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">Все сведения будут вымышленными. API-ключи читаются только сервером.</p>
    </form>
  );
}
