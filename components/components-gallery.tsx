"use client";

import { useEffect, useState } from "react";
import { COMPONENTS } from "@/data/components";
import { LIBRARY } from "./library";
import { CopyButton, plural } from "./modal";

export function ComponentsGallery({ sources }: { sources: Record<string, string> }) {
  const [slug, setSlug] = useState(COMPONENTS[0].slug);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [run, setRun] = useState(0);

  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      if (COMPONENTS.some((c) => c.slug === h)) setSlug(h);
    };
    fromHash();
    addEventListener("hashchange", fromHash);
    return () => removeEventListener("hashchange", fromHash);
  }, []);

  const meta = COMPONENTS.find((c) => c.slug === slug)!;
  const Comp = LIBRARY[slug];
  const code = sources[slug];
  const pick = (s: string) => { setSlug(s); setView("preview"); history.replaceState(null, "", `#${s}`); };
  const tab = (on: boolean) => `cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-ink text-bg" : "text-muted hover:text-ink"}`;

  return (
    <>
      <div className="flex flex-col gap-6 pt-6 pb-8 sm:flex-row sm:items-end sm:justify-between md:pt-12 md:pb-10">
        <div className="max-w-[960px]">
          <h1 className="text-[clamp(40px,6vw,68px)] leading-[1.02]">Компоненты, которые <em className="text-accent">хочется</em> трогать</h1>
          <p className="mt-5 text-lg text-muted">Живые превью и код, готовый к копированию.</p>
        </div>
        <div className="flex w-fit min-w-[160px] items-baseline gap-3 rounded-[20px] border border-line bg-surface px-5 py-3 shadow-warm sm:shrink-0">
          <span className="font-serif text-[42px] leading-none text-accent">{COMPONENTS.length}</span>
          <span className="text-sm font-semibold text-muted">{plural(COMPONENTS.length, "компонент", "компонента", "компонентов")}</span>
        </div>
      </div>

      <div className="grid gap-5 pb-16 lg:grid-cols-[260px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {COMPONENTS.map((c) => (
            <button
              key={c.slug}
              onClick={() => pick(c.slug)}
              className={`flex-none cursor-pointer rounded-2xl border px-4 py-3 text-left transition lg:w-full ${c.slug === slug ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent/45"}`}
            >
              <b className="block text-[15px] leading-tight">{c.title}</b>
              <small className="hidden text-xs text-muted lg:block">{c.tags.join(" · ")}</small>
            </button>
          ))}
        </nav>

        <section className="min-w-0 rounded-[26px] border border-line bg-surface p-4 shadow-warm sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-[620px]">
              <h2 className="text-[26px] leading-tight">{meta.title}</h2>

            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-line bg-bg p-1">
                <button className={tab(view === "preview")} onClick={() => setView("preview")}>Превью</button>
                <button className={tab(view === "code")} onClick={() => setView("code")}>Код</button>
              </div>
              {view === "preview" ? (
                <button onClick={() => setRun((n) => n + 1)} title="Перезапустить" className="size-9 cursor-pointer rounded-full border border-line bg-bg text-ink">↺</button>
              ) : (
                <CopyButton text={code} />
              )}
            </div>
          </div>

          {view === "preview" ? (
            <div
              className={`relative grid min-h-[640px] place-items-center overflow-hidden rounded-[20px] p-4 sm:p-8 ${
                meta.stage === "dark" ? "bg-[#0b0c0f]" : "bg-[#eef0f5]"
              }`}
              style={{
                backgroundImage: `radial-gradient(${meta.stage === "dark" ? "rgba(255,255,255,.06)" : "rgba(15,23,42,.07)"} 1px, transparent 1px)`,
                backgroundSize: "18px 18px",
              }}
            >
              <Comp key={`${slug}-${run}`} />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-[#17120f]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-xs text-[#b59d86]">
                <span>components/library/{meta.file}</span>
                <span>{code.split("\n").length} строк</span>
              </div>
              <pre className="max-h-[640px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#f3e5d3]"><code>{code}</code></pre>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
