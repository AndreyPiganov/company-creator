import { ProviderSettings } from "@/components/provider-settings";

export default function SettingsPage() {
  return <div className="mx-auto max-w-3xl px-5 py-10">
    <p className="text-sm font-semibold text-[var(--accent)]">Настройки</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">Подключение AI-провайдеров</h1>
    <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Добавьте ключ для генерации компаний. Локальный генератор работает без ключей. Сохранённый ключ не показывается повторно и не попадает в экспорт.</p>
    <ProviderSettings />
  </div>;
}
