"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Скиллы", icon: "✦" },
  { href: "/components", label: "Компоненты", icon: "◫" },
  { href: "/prompts", label: "Промпты", icon: "✎" },
];

function toggleTheme() {
  const el = document.documentElement;
  const dark = el.dataset.theme ? el.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const next = dark ? "light" : "dark";
  el.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
}

export function SiteHeader() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 py-5">
      <Link href="/" className="flex items-center gap-2.5 font-serif text-xl font-bold text-ink no-underline">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-lg text-[#fff8f0]">✦</span>
        Библиотека
      </Link>
      <div className="flex items-center gap-2">
        <nav className="flex gap-1 rounded-full border border-line bg-surface p-1 shadow-warm">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline transition-colors sm:px-4 ${
                active(t.href) ? "bg-ink text-bg" : "text-muted hover:bg-bg2 hover:text-ink"
              }`}
            >
              <span className="mr-1.5 hidden sm:inline">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={toggleTheme}
          title="Тема"
          className="size-9 cursor-pointer rounded-full border border-line bg-surface text-base text-ink"
        >
          ◐
        </button>
      </div>
    </header>
  );
}
