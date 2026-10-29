"use client";

import { useEffect, useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { browserApiUrl } from "@/lib/api";

type Status = { id: "openai" | "openrouter"; configured: boolean; source: "panel" | "environment" | "none"; environmentConfigured: boolean };

export function ProviderSettings() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    fetch(browserApiUrl("/api/settings/providers"), { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error(); setStatuses((await response.json()).providers); })
      .catch(() => setNotice("Не удалось загрузить настройки. Обновите страницу."));
  }, []);
  return <div className="mt-8 space-y-5">
    {notice && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{notice}</p>}
    {!statuses.length && !notice && <p role="status">Загрузка настроек…</p>}
    {statuses.map((status) => <ProviderKeyForm key={status.id} status={status} onSaved={setStatuses} />)}
    <p className="text-xs leading-6 text-[var(--muted)]">Ключ из панели имеет приоритет над .env. После удаления ключа из панели снова используется .env, если он настроен. Сохранение не проверяет доступ у провайдера и не запускает платную генерацию.</p>
  </div>;
}

function ProviderKeyForm({ status, onSaved }: { status: Status; onSaved: (statuses: Status[]) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const label = status.id === "openai" ? "OpenAI" : "OpenRouter";
  async function update(action: "save" | "remove") {
    if (busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(browserApiUrl("/api/settings/providers"), {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: status.id, action, ...(action === "save" ? { key: value } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) { setNotice(payload.error || "Не удалось сохранить настройки"); return; }
      setValue(""); onSaved(payload.providers);
      setNotice(action === "save" ? "Ключ сохранён. Его можно использовать при создании компании." : "Ключ из панели удалён.");
    } catch { setNotice("Нет связи с сервером. Проверьте состояние настроек перед повтором."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={(event) => { event.preventDefault(); void update("save"); }} className="rounded-2xl border border-[var(--line)] bg-white p-6">
    <h2 className="flex items-center gap-3 text-xl font-semibold"><KeyRound size={20} />{label}</h2>
    <p className="mt-3 text-sm text-[var(--muted)]">{status.source === "panel" ? "Ключ сохранён в панели" : status.source === "environment" ? "Используется ключ из .env" : "Ключ не настроен"}</p>
    <label className="mt-5 block text-sm font-medium">{status.configured ? `Новый ключ ${label}` : `API-ключ ${label}`}<input type="password" name={`${status.id}-key`} value={value} onChange={(event) => setValue(event.target.value)} required minLength={10} maxLength={1024} autoComplete="new-password" spellCheck={false} disabled={busy} className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3" placeholder="Вставьте API-ключ" /></label>
    <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || !value.trim()} className="primary-button">{busy && <LoaderCircle size={16} className="animate-spin" />}{status.configured ? "Заменить ключ" : "Сохранить ключ"}</button>{status.source === "panel" && <button type="button" disabled={busy} onClick={() => void update("remove")} className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm">Удалить ключ из панели</button>}</div>
    {notice && <p role="status" className="mt-4 text-sm leading-6">{notice}</p>}
  </form>;
}
