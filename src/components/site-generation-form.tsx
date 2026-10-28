"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PanelsTopLeft, TriangleAlert } from "lucide-react";

type Job = { id: string; state: string; resultId: string | null; error: string | null };
const control = "mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--accent)]";

export function SiteGenerationForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function poll(id: string) {
    const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error || "Не удалось получить статус");
    setJob(payload.job);
    if (payload.job.state === "complete" && payload.job.resultId) {
      router.push(`/sites/${payload.job.resultId}/preview/index.html`);
      return;
    }
    if (payload.job.state === "failed") return setError(payload.job.error || "Не удалось создать сайт");
    timer.current = setTimeout(() => poll(id), 600);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/companies/${companyId}/sites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: data.get("language"), theme: data.get("theme") }),
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error || "Не удалось запустить создание сайта");
    setJob(payload.job);
    await poll(payload.job.id);
  }

  const busy = job && !["complete", "failed"].includes(job.state);
  return <form onSubmit={submit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(24,32,29,.08)] sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Язык сайта<select name="language" className={control}><option value="ru">Русский</option><option value="de">Deutsch</option></select></label><label className="text-sm font-medium">Цветовая тема<select name="theme" className={control}><option value="forest">Лесной</option><option value="midnight">Полночный</option><option value="sand">Песочный</option><option value="berry">Ягодный</option></select></label></div>{busy && <div className="mt-6 flex items-center gap-3 rounded-xl bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent)]"><LoaderCircle className="animate-spin" size={18} /> Этап: <strong>{job.state}</strong></div>}{error && <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><TriangleAlert size={18} />{error}</div>}<button disabled={Boolean(busy)} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <PanelsTopLeft size={18} />}{busy ? "Сборка…" : "Создать версию сайта"}</button><p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">Сайт собирается без платного AI-запроса из утверждённой карточки.</p></form>;
}
