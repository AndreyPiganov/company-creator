"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";
import { browserApiUrl } from "@/lib/api";
import { jobStage } from "./job-progress";

type Job = {
  id: string;
  state: string;
  attempt: number;
  costUsd: number;
  resultId: string | null;
  error: string | null;
};

type ProviderInfo = {
  id: "offline" | "openai" | "openrouter";
  label: string;
  configured: boolean;
  models: Array<{ id: string; label: string; inputUsdPerMillion?: number; outputUsdPerMillion?: number; outputReserveUsd?: number; exceedsBudget?: boolean }>;
  error?: string | null;
};

const control = "mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--accent)]";

export function GenerationForm() {
  const router = useRouter();
  const [provider, setProvider] = useState("offline");
  const [providers, setProviders] = useState<ProviderInfo[]>([
    { id: "offline", label: "Локальный генератор", configured: true, models: [{ id: "offline", label: "Offline" }] },
  ]);
  const [model, setModel] = useState("");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(0.25);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(browserApiUrl("/api/providers"), { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => { setProviders(payload.providers ?? []); setBudget(payload.budgetUsd ?? 0.25); })
      .catch(() => setError("Не удалось загрузить каталог моделей. Локальный генератор остаётся доступен."));
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  const selectedProvider = providers.find((item) => item.id === provider);
  const selectedModel = selectedProvider?.models.find((item) => item.id === model);
  const visibleModels = selectedProvider?.models.filter((item) => `${item.id} ${item.label}`.toLowerCase().includes(query.toLowerCase()));

  function chooseProvider(nextProvider: string) {
    setProvider(nextProvider);
    setQuery("");
    const info = providers.find((item) => item.id === nextProvider);
    setModel(info?.models.find((item) => !item.exceedsBudget)?.id ?? "");
  }

  async function poll(id: string) {
    const response = await fetch(browserApiUrl(`/api/jobs/${id}`), { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Не удалось получить статус задачи");
      setJob(null);
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
    pollRef.current = setTimeout(() => { void poll(id).catch(() => { setError("Связь прервана. Задача продолжает выполняться; результат появится в библиотеке."); setJob(null); }); }, 750);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
    const response = await fetch(browserApiUrl("/api/generation/companies"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        brandName: form.get("brandName"),
        country: "DE",
        businessDirection: "b2b-ai-investment-research",
        serviceType: form.get("serviceType"),
        size: form.get("size"),
        provider,
        model: provider === "offline" ? undefined : model,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Не удалось запустить генерацию");
      return;
    }
    setJob(payload.job);
    await poll(payload.job.id);
    } catch {
      setError("Не удалось связаться с сервером. Проверьте библиотеку перед повторным запуском.");
      setJob(null);
    } finally { setSubmitting(false); }
  }

  const busy = submitting || (job && !["complete", "failed"].includes(job.state));

  return (
    <form onSubmit={submit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(24,32,29,.08)] sm:p-8">
      <div className="mb-6 flex flex-wrap gap-2 text-xs font-medium text-[var(--accent)]"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-2">Германия</span><span className="rounded-full bg-[var(--accent-soft)] px-3 py-2">B2B · ИИ и исследования</span><span className="rounded-full bg-[var(--accent-soft)] px-3 py-2">Карточка на RU + DE</span></div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium">Название бренда <span className="text-[var(--muted)]">(пусто = случайное)</span><input name="brandName" maxLength={80} className={control} placeholder="Например, Nordlicht Research" /></label>
        <label className="text-sm font-medium">Масштаб<select name="size" className={control} defaultValue="random"><option value="random">Случайный</option><option value="small">Небольшая</option><option value="medium">Средняя</option></select></label>
        <label className="text-sm font-medium">Тип сервиса<select name="serviceType" className={control} defaultValue="random"><option value="random">Случайный</option><option value="investment-due-diligence">Investment due diligence</option><option value="market-intelligence">Market intelligence</option><option value="portfolio-monitoring">Мониторинг портфеля</option><option value="document-data-analysis">Анализ документов</option></select></label>
        <label className="text-sm font-medium">Провайдер<select name="provider" value={provider} onChange={(event) => chooseProvider(event.target.value)} className={control}>{providers.map((item) => <option key={item.id} value={item.id} disabled={!item.configured}>{item.label}{item.configured ? "" : " — ключ не настроен"}</option>)}</select></label>
        {provider !== "offline" && <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[#f7faf8] p-5 md:col-span-2">
          <label className="block text-sm font-medium">Поиск по названию или разработчику<input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Например, GPT, Claude или Gemini" className={control} /></label>
          <label className="block text-sm font-medium">Модель · найдено {visibleModels?.length ?? 0}<select name="model" value={model} onChange={(event) => setModel(event.target.value)} className={control} required><option value="" disabled>{selectedProvider?.error || "Выберите модель"}</option>{selectedModel && !visibleModels?.some((item) => item.id === model) && <option value={model}>{selectedModel.label} — выбрана</option>}{visibleModels?.map((item) => <option key={item.id} value={item.id} disabled={item.exceedsBudget}>{item.label}{item.exceedsBudget ? " — выше бюджета" : ""}</option>)}</select></label>
          {selectedModel && <div className="text-sm leading-6 text-[var(--muted)]"><p>За 1 млн токенов: вход ${selectedModel.inputUsdPerMillion?.toFixed(2)} · выход ${selectedModel.outputUsdPerMillion?.toFixed(2)}</p><p>Лимит операции: ${budget.toFixed(2)}. Перед запросом сервер проверит стоимость с учётом входных данных.</p><p className="mt-2 text-xs">Доступность модели зависит от вашего аккаунта провайдера.</p></div>}
          {selectedProvider?.error && <p role="alert" className="text-sm text-red-700">{selectedProvider.error}</p>}
        </div>}
      </div>
      {job && busy && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent)]" role="status">
          <LoaderCircle className="animate-spin" size={19} />
          <span><strong>{jobStage(job.state)}</strong>{job.attempt > 0 ? ` · попытка ${job.attempt}` : ""} · ${job.costUsd.toFixed(4)}</span>
        </div>
      )}
      {error && <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><TriangleAlert size={18} /><span>{error}</span></div>}
      <button disabled={Boolean(busy) || selectedModel?.exceedsBudget || (provider !== "offline" && !model)} className="primary-button mt-7 w-full">
        {busy ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {busy ? "Генерация…" : "Создать карточку"}
      </button>
      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">Все сведения будут вымышленными. API-ключи читаются только сервером.</p>
    </form>
  );
}
