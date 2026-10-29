import type { Metadata } from "next";
import Link from "next/link";
import { Building2, LibraryBig, Sparkles, Settings } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Company Creator",
    template: "%s · Company Creator",
  },
  description: "Панель создания вымышленных компаний и версионных статических сайтов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b border-[var(--line)] bg-[rgba(255,253,248,.86)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <Link href="/" className="flex items-center gap-3 font-semibold tracking-[-0.02em]">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] text-white">
                <Building2 size={20} aria-hidden="true" />
              </span>
              <span>
                Company Creator
                <span className="block text-xs font-normal text-[var(--muted)]">Студия компаний и сайтов</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm" aria-label="Основная навигация">
              <Link href="/settings" aria-label="Настройки провайдеров" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white"><Settings size={16} aria-hidden="true" /><span className="hidden sm:inline">Настройки</span></Link>
              <Link href="/companies" aria-label="Библиотека компаний" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white">
                <LibraryBig size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Библиотека</span>
              </Link>
              <Link href="/companies/new" className="primary-button">
                <Sparkles size={16} aria-hidden="true" />
                <span>Создать компанию</span>
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
