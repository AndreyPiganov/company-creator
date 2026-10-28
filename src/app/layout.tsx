import type { Metadata } from "next";
import Link from "next/link";
import { Building2, LibraryBig, Sparkles } from "lucide-react";
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
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
            <Link href="/" className="flex items-center gap-3 font-semibold tracking-[-0.02em]">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] text-white">
                <Building2 size={20} aria-hidden="true" />
              </span>
              <span>
                Company Creator
                <span className="block text-xs font-normal text-[var(--muted)]">Fictional B2B studio</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm" aria-label="Основная навигация">
              <Link href="/companies" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white">
                <LibraryBig size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Библиотека</span>
              </Link>
              <Link href="/companies/new" className="flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2 text-white hover:opacity-90">
                <Sparkles size={16} aria-hidden="true" />
                <span>Создать</span>
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
