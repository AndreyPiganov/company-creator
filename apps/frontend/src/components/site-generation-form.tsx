"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, PanelsTopLeft, TriangleAlert } from "lucide-react";
import { browserApiUrl } from "@/lib/api";
import { jobStage } from "./job-progress";

type Job = { id: string; state: string; resultId: string | null; error: string | null };
const themes = [
  { id: "forest", name: "Лесной", detail: "Зелёный · спокойный и естественный", paper: "#f3f1e9", ink: "#246a54", soft: "#dcebe4" },
  { id: "midnight", name: "Полночный", detail: "Синий · строгий и технологичный", paper: "#eef1f6", ink: "#315eaa", soft: "#dce6f7" },
  { id: "sand", name: "Песочный", detail: "Терракотовый · тёплый и редакционный", paper: "#f6f0e6", ink: "#a04f2f", soft: "#f1dfd2" },
  { id: "berry", name: "Ягодный", detail: "Сливовый · выразительный и мягкий", paper: "#f6eff4", ink: "#8b315f", soft: "#eed9e5" },
];

export function SiteGenerationForm({ companyId }: { companyId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("forest");
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function poll(id: string) {
    try {
      const response = await fetch(browserApiUrl(`/api/jobs/${id}`), { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error("Не удалось получить статус. Проверьте библиотеку версий.");
      setJob(payload.job);
      if (payload.job.state === "complete" && payload.job.resultId) {
        window.location.assign(browserApiUrl(`/sites/${payload.job.resultId}/preview/index.html`));
        return;
      }
      if (payload.job.state === "failed") { setError(payload.job.error || "Не удалось создать сайт"); return; }
      timer.current = setTimeout(() => { void poll(id); }, 600);
    } catch {
      setError("Связь прервана. Проверьте библиотеку версий перед повторным запуском.");
      setJob(null);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(browserApiUrl(`/api/companies/${companyId}/sites`), {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: data.get("language"), theme }),
      });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error || "Не удалось запустить создание сайта"); return; }
      setJob(payload.job);
      await poll(payload.job.id);
    } catch { setError("Не удалось связаться с сервером. Проверьте библиотеку версий перед повторным запуском."); }
    finally { setSubmitting(false); }
  }

  const busy = submitting || (job && !["complete", "failed"].includes(job.state));
  return <form onSubmit={submit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(24,32,29,.06)] sm:p-8">
    <label className="block text-sm font-medium">Язык сайта<select name="language" className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3"><option value="ru">Русский</option><option value="de">Deutsch</option></select></label>
    <fieldset disabled={Boolean(busy)} className="mt-7"><legend className="mb-4 font-semibold">Выберите характер сайта</legend><div className="grid gap-4 sm:grid-cols-2">{themes.map((item) => <label key={item.id} className="theme-option">
      <input className="sr-only" type="radio" name="theme" value={item.id} checked={theme === item.id} onChange={() => setTheme(item.id)} />
      <div aria-hidden="true" className="theme-miniature" style={{ background: item.paper }}><div><div className="mb-5 h-1 w-8 rounded" style={{ background: item.ink }} /><div className="h-2 w-full rounded" style={{ background: item.ink }} /><div className="mt-2 h-2 w-3/4 rounded" style={{ background: item.ink }} /><div className="mt-4 h-4 w-12 rounded" style={{ background: item.ink }} /></div><div className="grid content-center gap-2 rounded-lg p-3" style={{ background: item.soft }}>{[0, 1, 2].map((i) => <div key={i} className="h-4 rounded bg-white/80" />)}</div></div>
      <span className="mt-3 flex items-center justify-between text-sm font-semibold">{item.name}{theme === item.id && <Check size={17} className="text-[var(--accent)]" />}</span><span className="mt-1 block text-xs text-[var(--muted)]">{item.detail}</span>
    </label>)}</div></fieldset>
    <div className="mt-6 rounded-xl bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--accent)]">Три страницы: главная, продукт, компания и контакты. Адаптивная вёрстка, фотографии команды и локальные ресурсы в ZIP.</div>
    {busy && <p className="mt-5 flex items-center gap-2 text-sm" role="status"><LoaderCircle className="animate-spin" size={18} />{job ? jobStage(job.state) : "Запускаем сборку…"}</p>}
    {error && <div role="alert" className="mt-5 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"><TriangleAlert size={18} />{error}</div>}
    <button disabled={Boolean(busy)} className="primary-button mt-7 w-full">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <PanelsTopLeft size={18} />}{busy ? "Собираем сайт…" : "Создать версию сайта"}</button>
    <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">Новая версия сохранится отдельно. Сборка сайта не требует платного AI-запроса.</p>
  </form>;
}
