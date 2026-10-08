"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, COMBOS, PACKS, type Pack } from "@/data/skills";
import COMMANDS from "@/data/commands.json";
import { CopyButton, Modal, plural } from "./modal";

const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const packById = Object.fromEntries(PACKS.map((p) => [p.id, p]));
const SPECIAL: Record<string, string> = { "claude-code": "claude-code", "anthropic-skills": "anthropic-skills", kie: "local/kie-image-gen" };
const cmdsOf = (p: Pack): string[] => (COMMANDS as Record<string, string[]>)[p.src || SPECIAL[p.id]] || [];
const combosOf = (id: string) => COMBOS.filter((c) => c.steps.some((s) => s[0] === id));
const origin = (p: Pack) => (p.builtin ? "встроено" : p.plugin ? "плагин" : p.own ? "свой" : "GitHub");
const installCmd = (p: Pack) => (p.src ? (p.plugin ? `/plugin install ${p.src.split("/")[1]}` : `npx skills add ${p.src}`) : "");
const totalCmds = PACKS.reduce((n, p) => n + cmdsOf(p).length, 0);

const card = "rounded-[22px] border border-line bg-surface shadow-warm";

function Step({ step: [pid, role], hot, onOpen }: { step: [string, string]; hot?: boolean; onOpen: (id: string) => void }) {
  const p = packById[pid];
  return (
    <button
      onClick={() => onOpen(pid)}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-[14px] border bg-bg py-[7px] pr-3 pl-2 text-left transition-colors hover:border-accent hover:bg-accent-soft ${hot ? "border-accent" : "border-line"}`}
    >
      <span className="grid size-[30px] flex-none place-items-center rounded-[9px] bg-bg2 text-[15px]">{p.icon}</span>
      <span>
        <b className="block text-[13.5px] leading-tight">{p.name}</b>
        <small className="block text-xs leading-snug text-muted">{role}</small>
      </span>
    </button>
  );
}

function Chain({ steps, hot, onOpen }: { steps: [string, string][]; hot?: string; onOpen: (id: string) => void }) {
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => (
        <div key={i}>
          {i > 0 && <span className="ml-[22px] block h-3.5 border-l-2 border-dashed border-accent/55" />}
          <Step step={s} hot={s[0] === hot} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

function PackModal({ id, onClose, onOpen }: { id: string | null; onClose: () => void; onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const p = id ? packById[id] : null;
  if (!p) return null;
  const c = catById[p.cat], cmds = cmdsOf(p), combos = combosOf(p.id), used = p.usedCmds || {};
  const install = installCmd(p);
  const list = cmds.filter((x) => x.includes(q)).sort((a, b) => (used[b] || 0) - (used[a] || 0));

  return (
    <Modal open onClose={onClose}>
      <span className="text-[13px] font-bold text-muted">{c.emoji} {c.name} · {origin(p)}{p.installed === false && " · не установлен"}</span>
      <h3 className="mt-2 mb-3 text-[22px] leading-tight font-bold">{p.icon} {p.name}</h3>
      <div>{p.d}</div>
      {p.src && (
        <p className="mt-2.5">
          <a className="text-accent" href={`https://github.com/${p.src}`} target="_blank" rel="noopener">github.com/{p.src} ↗</a>
        </p>
      )}
      {install && (
        <div className="my-4 flex items-center justify-between gap-2.5 rounded-xl border border-dashed border-line bg-bg px-3.5 py-2.5">
          <code className="font-mono text-[.88em]">{install}</code>
          <CopyButton text={install} />
        </div>
      )}
      <h4 className="mt-4.5 mb-2 text-sm font-bold text-muted">Команды внутри · {cmds.length}</h4>
      {cmds.length > 30 && (
        <input className="mb-2.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 outline-none focus:border-accent" placeholder="Поиск по командам…" value={q} onChange={(e) => setQ(e.target.value.trim().toLowerCase())} />
      )}
      <div className="flex max-h-80 flex-wrap gap-1.5 overflow-auto p-0.5">
        {list.map((x) => (
          <span key={x} title={used[x] ? `вызывалась ${used[x]}×` : ""} className={`rounded-[9px] border px-2.5 py-1 font-mono text-[12.5px] font-semibold ${used[x] ? "border-accent bg-accent-soft text-accent" : "border-line bg-bg"}`}>
            /{x}{used[x] ? ` ★${used[x]}` : ""}
          </span>
        ))}
      </div>
      {combos.length > 0 && (
        <>
          <h4 className="mt-4.5 mb-2 text-sm font-bold text-muted">Входит в связки</h4>
          {combos.map((cb) => (
            <div key={cb.name} className="mb-3">
              <b>{cb.icon} {cb.name}</b>
              <div className="mt-1.5"><Chain steps={cb.steps} hot={p.id} onOpen={onOpen} /></div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}

export function SkillsLibrary() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    PACKS.forEach((p) => (m[p.cat] = (m[p.cat] || 0) + 1));
    return m;
  }, []);

  const query = q.trim().toLowerCase();
  const list = PACKS.filter(
    (p) => (cat === "all" || p.cat === cat) && (!query || [p.name, p.src, p.d, catById[p.cat].name, ...cmdsOf(p)].join(" ").toLowerCase().includes(query)),
  ).sort((a, b) => (b.used || 0) - (a.used || 0));

  const chip = (on: boolean) => `cursor-pointer rounded-full border px-3.5 py-[7px] text-[13.5px] font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink"}`;

  return (
    <>
      <div className="grid items-end gap-6 pt-6 pb-10 md:grid-cols-[1.3fr_1fr] md:gap-10 md:pt-12">
        <div>
          <h1 className="text-[clamp(40px,6vw,68px)] leading-[1.02]">Наборы, которые <em className="text-accent">работают</em> вместе</h1>
          <p className="mt-4.5 max-w-[520px] text-lg text-muted">Всё, что установлено у меня в Claude Code: один набор — один репозиторий или плагин. Внутри — команды, а ниже — проверенные связки между наборами.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[[PACKS.length, "наборов"], [PACKS.filter((p) => p.used).length, "в активной работе"], [COMBOS.length, "связок"], [totalCmds, "команд внутри"]].map(([n, t]) => (
            <div key={t} className="rounded-[20px] border border-line bg-surface px-5 py-4.5 shadow-warm">
              <b className="block font-serif text-[34px] leading-tight text-accent">{n}</b>
              <small className="font-semibold text-muted">{t}</small>
            </div>
          ))}
        </div>
      </div>

      <section id="combos" className="py-9">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[26px] md:text-[32px]">Связки</h2>
          <p className="text-muted">Как наборы складываются под задачу · нажмите на набор, чтобы открыть его</p>
        </div>
        <div className="grid gap-4 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
          {COMBOS.map((c) => (
            <div key={c.name} className={`${card} p-5`}>
              <h3 className="flex items-center gap-2.5 text-xl">
                <i className="grid size-[34px] place-items-center rounded-[10px] bg-bg2 text-[17px] not-italic">{c.icon}</i>
                {c.name}
              </h3>
              <p className="mt-1.5 mb-3.5 text-sm text-muted">{c.hint}</p>
              <Chain steps={c.steps} onOpen={setOpen} />
            </div>
          ))}
        </div>
      </section>

      <section id="library" className="py-9">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[26px] md:text-[32px]">Наборы</h2>
          <p className="text-muted">{list.length} {plural(list.length, "набор", "набора", "наборов")}</p>
        </div>
        <div className="mb-5.5 flex flex-col gap-3.5">
          <input
            className="w-full rounded-2xl border border-line bg-surface px-4.5 py-3.5 shadow-warm outline-none focus:border-accent"
            placeholder="🔍  Найти набор или команду: дизайн, tdd, seo, pdf…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button className={chip(cat === "all")} onClick={() => setCat("all")}>Все<small className="ml-1 opacity-60">{PACKS.length}</small></button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={chip(cat === c.id)} onClick={() => setCat(c.id)}>
                {c.emoji} {c.name}<small className="ml-1 opacity-60">{counts[c.id] || 0}</small>
              </button>
            ))}
          </div>
        </div>
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {list.map((p) => {
              const n = cmdsOf(p).length, c = catById[p.cat], k = combosOf(p.id).length;
              return (
                <button key={p.id} onClick={() => setOpen(p.id)} className={`${card} flex cursor-pointer flex-col gap-2.5 p-5 text-left transition hover:-translate-y-[3px] hover:border-accent/45`}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-[46px] flex-none place-items-center rounded-[14px] bg-bg2 text-[22px]">{p.icon}</span>
                    <div>
                      <h3 className="text-[21px] leading-tight">{p.name}</h3>
                      <div className="font-mono text-[12.5px] text-muted">{p.src || origin(p)}</div>
                    </div>
                  </div>
                  <div className="text-[14.5px] text-muted">{p.d}</div>
                  <div className="flex flex-wrap gap-[5px]">
                    {p.key.slice(0, 5).map((x) => (
                      <span key={x} className="rounded-lg border border-line bg-bg px-2 py-[3px] font-mono text-xs font-semibold">/{x}</span>
                    ))}
                    {n > 5 && <span className="rounded-lg border border-line bg-bg px-2 py-[3px] font-mono text-xs font-semibold">+{n - Math.min(5, p.key.length)}</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5 text-xs font-bold">
                    <span className="rounded-full bg-bg2 px-2.5 py-1 text-muted">{c.emoji} {c.name}</span>
                    <span className="rounded-full bg-bg2 px-2.5 py-1 text-muted">{n} {plural(n, "команда", "команды", "команд")}</span>
                    {k > 0 && <span className="rounded-full bg-bg2 px-2.5 py-1 text-muted">🔗 {k} {plural(k, "связка", "связки", "связок")}</span>}
                    {p.used ? <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">★ {p.used}× в работе</span> : null}
                    {p.installed === false && <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-muted">не установлен</span>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted">Ничего не нашлось — попробуйте другое слово</div>
        )}
      </section>

      <footer className="pt-10 pb-15 text-center text-sm text-muted">
        Собрано из <code className="font-mono">~/.agents/.skill-lock.json</code>, <code className="font-mono">~/.claude/skills</code> и плагинов · ставятся через <code className="font-mono">npx skills add автор/репо</code>
      </footer>

      <PackModal key={open} id={open} onClose={() => setOpen(null)} onOpen={setOpen} />
    </>
  );
}
