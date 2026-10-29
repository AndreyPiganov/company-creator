"use client";

import { useState } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import type { CompanyProfile } from "@/lib/domain/company";
import { browserApiUrl } from "@/lib/api";

export function TeamPhotoInput({ index, control, setValue, onBusy }: { index: number; control: Control<CompanyProfile>; setValue: UseFormSetValue<CompanyProfile>; onBusy: (delta: number) => void }) {
  const member = useWatch({ control, name: `team.${index}` });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploaded = member.photo.asset.startsWith("/api/photos/");
  const url = browserApiUrl(uploaded ? member.photo.asset : member.photo.asset.replace("/assets/team/", "/api/team-assets/"));

  async function upload(file?: File) {
    if (!file || busy) return;
    setError("");
    if (file.size > 5 * 1024 * 1024) { setError("Выберите файл не больше 5 МБ"); return; }
    setBusy(true); onBusy(1);
    try {
      const body = new FormData(); body.set("photo", file);
      const response = await fetch(browserApiUrl("/api/photos"), { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error || "Не удалось загрузить фотографию"); return; }
      setValue(`team.${index}.photo`, { asset: payload.asset, position: 0, alt: { ru: `Портрет ${member.name}`, de: `Porträt von ${member.name}` } }, { shouldDirty: true });
    } catch { setError("Не удалось загрузить фотографию. Проверьте соединение."); }
    finally { setBusy(false); onBusy(-1); }
  }
  return <div className="mb-5 flex flex-wrap items-start gap-5 rounded-xl bg-[var(--accent-soft)] p-4">
    <div role="img" aria-label={`Фотография ${member.name}`} className="h-40 w-30 shrink-0 rounded-xl bg-white" style={{ backgroundImage: `url("${url}")`, backgroundSize: uploaded ? "cover" : "500% auto", backgroundPosition: uploaded ? "center" : `${member.photo.position * 25}% center` }} />
    <div className="min-w-0 flex-1"><label className="block text-sm font-semibold">Фотография сотрудника<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void upload(file); }} className="mt-3 block w-full max-w-full text-xs file:mr-3 file:rounded-lg file:border file:border-[var(--line)] file:bg-white file:px-3 file:py-2" /></label>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">JPEG, PNG или WebP, до 5 МБ. Фото обрезается по центру до 3:4. После загрузки сохраните карточку и создайте новую версию сайта.</p>
      {busy && <p role="status" className="mt-2 text-sm">Загружаем фотографию…</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  </div>;
}
