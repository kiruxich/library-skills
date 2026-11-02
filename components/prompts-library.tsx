"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROMPTS, type Prompt } from "@/data/prompts";
import { CopyButton, Modal, plural } from "./modal";

const KEY = "prompts.v1";
type Local = Prompt & { local: true };

function loadLocal(): Local[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Prompt[]).map((p) => ({ ...p, local: true as const })) : [];
  } catch {
    return [];
  }
}
function saveLocal(list: Local[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.map(({ local: _, ...p }) => p)));
  } catch {}
}

const fullText = (p: Prompt) =>
  p.steps ? p.steps.map((s, i) => `${i + 1}/ ${s.title}\n${s.text}`).join("\n\n") : p.text || "";

const field = "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 outline-none focus:border-accent";

function Editor({ initial, onSave, onClose }: { initial?: Local; onSave: (p: Local) => void; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [source, setSource] = useState(initial?.source ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      text: text.trim(),
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      source: source.trim() || undefined,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
      local: true,
    });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-4 text-[22px] font-bold">{initial ? "Изменить промпт" : "Новый промпт"}</h3>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="text-sm font-bold text-muted">Название
          <input className={`${field} mt-1 font-normal text-ink`} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label className="text-sm font-bold text-muted">Коротко — зачем он
          <input className={`${field} mt-1 font-normal text-ink`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="text-sm font-bold text-muted">Текст промпта
          <textarea className={`${field} mt-1 min-h-48 font-mono text-sm font-normal text-ink`} value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold text-muted">Теги через запятую
            <input className={`${field} mt-1 font-normal text-ink`} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="код, ревью" />
          </label>
          <label className="text-sm font-bold text-muted">Источник
            <input className={`${field} mt-1 font-normal text-ink`} value={source} onChange={(e) => setSource(e.target.value)} placeholder="@автор или ссылка" />
          </label>
        </div>
        <button className="mt-2 cursor-pointer self-start rounded-xl bg-accent px-5 py-2.5 font-bold text-[#fff8f0]">Сохранить</button>
      </form>
    </Modal>
  );
}

function Viewer({ p, onClose, onEdit, onDelete }: { p: Prompt | Local; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const local = "local" in p;
  return (
    <Modal open onClose={onClose} wide>
      <h3 className="mb-3 pr-20 text-[24px] leading-tight font-bold">{p.title}</h3>
      {p.description && <p className="text-muted">{p.description.split(/[:.!?]/)[0]}.</p>}
      <div className="my-4 flex flex-wrap items-center justify-between gap-2">
        {p.steps && <span className="rounded-xl bg-bg2 px-3 py-1.5 text-sm font-bold">{p.steps.length} {plural(p.steps.length, "шаг", "шага", "шагов")}</span>}
        <CopyButton text={fullText(p)} label={p.steps ? "Копировать все шаги" : "Копировать промпт"} />
        {local && (
          <>
            <button onClick={onEdit} className="cursor-pointer rounded-[10px] bg-bg2 px-3 py-1.5 text-[13px] font-bold">Изменить</button>
            <button onClick={onDelete} className="cursor-pointer rounded-[10px] bg-bg2 px-3 py-1.5 text-[13px] font-bold text-accent">Удалить</button>
          </>
        )}
      </div>
      {p.steps ? (
        <ol className="flex flex-col gap-3">
          {p.steps.map((s, i) => (
            <li key={i}>
              <details open={i === 0 ? true : undefined} className="group rounded-2xl border border-line bg-bg">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <b className="font-serif text-lg">{i + 1}/ {s.title}</b>
                  <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-4 pb-4">
                  {s.hint && <p className="mb-2 text-sm text-muted">{s.hint}</p>}
                  <p className="text-[15px] whitespace-pre-wrap">{s.text}</p>
                  <CopyButton text={s.text} className="mt-4" />
                </div>
              </details>
            </li>
          ))}
        </ol>
      ) : (
        <pre className="rounded-2xl border border-line bg-bg p-4 font-mono text-sm whitespace-pre-wrap">{p.text}</pre>
      )}
    </Modal>
  );
}

export function PromptsLibrary() {
  const [local, setLocal] = useState<Local[]>([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<Local | "new" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocal(loadLocal()), []);
  const update = (list: Local[]) => { setLocal(list); saveLocal(list); };

  const all: (Prompt | Local)[] = useMemo(
    () => [...local, ...PROMPTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [local],
  );
  const tags = useMemo(() => [...new Set(all.flatMap((p) => p.tags))].sort(), [all]);
  const query = q.trim().toLowerCase();
  const list = all.filter(
    (p) => (!tag || p.tags.includes(tag)) && (!query || [p.title, p.description, fullText(p), ...p.tags].join(" ").toLowerCase().includes(query)),
  );
  const current = all.find((p) => p.id === open);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(local.map(({ local: _, ...p }) => p), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prompts.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Prompt[];
      const known = new Set(local.map((p) => p.id));
      update([...local, ...data.filter((p) => p.id && p.title && !known.has(p.id)).map((p) => ({ ...p, tags: p.tags ?? [], local: true as const }))]);
    } catch {
      alert("Не получилось прочитать файл — нужен JSON, выгруженный отсюда же.");
    }
  };

  const chip = (on: boolean) => `cursor-pointer rounded-full border px-3.5 py-[7px] text-[13.5px] font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink"}`;
  const ghost = "cursor-pointer rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-bold";

  return (
    <>
      <div className="pt-6 pb-8 md:pt-12">
        <h1 className="text-[clamp(40px,6vw,68px)] leading-[1.02]">Промпты, которые <em className="text-accent">сработали</em></h1>
        <p className="mt-4.5 max-w-[620px] text-lg text-muted">
          Копилка проверенных формулировок. Постоянные лежат в репозитории, новые сохраняются в этом браузере — выгружайте их в JSON, чтобы не потерять.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button onClick={() => setEditing("new")} className="cursor-pointer rounded-xl bg-accent px-4 py-2 text-sm font-bold text-[#fff8f0]">+ Новый промпт</button>
        <button onClick={exportJson} className={ghost} disabled={!local.length}>Выгрузить JSON</button>
        <button onClick={() => fileRef.current?.click()} className={ghost}>Загрузить JSON</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <span className="ml-auto text-sm text-muted">{list.length} {plural(list.length, "промпт", "промпта", "промптов")}</span>
      </div>

      <div className="mb-6 flex flex-col gap-3.5">
        <input className="w-full rounded-2xl border border-line bg-surface px-4.5 py-3.5 shadow-warm outline-none focus:border-accent" placeholder="🔍  Найти промпт по словам…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button className={chip(!tag)} onClick={() => setTag(null)}>Все</button>
            {tags.map((t) => <button key={t} className={chip(tag === t)} onClick={() => setTag(t)}>#{t}</button>)}
          </div>
        )}
      </div>

      {list.length ? (
        <div className="grid gap-4 pb-16 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
          {list.map((p) => (
            <button key={p.id} onClick={() => setOpen(p.id)} className="flex cursor-pointer flex-col gap-2.5 rounded-[22px] border border-line bg-surface p-5 text-left shadow-warm transition hover:-translate-y-[3px] hover:border-accent/45">
              <h3 className="text-[21px] leading-tight">{p.title}</h3>
              <p className="line-clamp-3 text-[14.5px] text-muted">{p.description || fullText(p)}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 text-xs font-bold">
                {p.steps && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{p.steps.length} {plural(p.steps.length, "шаг", "шага", "шагов")}</span>}
                {p.tags.map((t) => <span key={t} className="rounded-full bg-bg2 px-2.5 py-1 text-muted">#{t}</span>)}
                {"local" in p && <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-muted">в браузере</span>}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted">Ничего не нашлось</div>
      )}

      {current && !editing && (
        <Viewer
          p={current}
          onClose={() => setOpen(null)}
          onEdit={() => setEditing(current as Local)}
          onDelete={() => {
            if (!confirm(`Удалить «${current.title}»?`)) return;
            update(local.filter((x) => x.id !== current.id));
            setOpen(null);
          }}
        />
      )}
      {editing && (
        <Editor
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            update(local.some((x) => x.id === p.id) ? local.map((x) => (x.id === p.id ? p : x)) : [p, ...local]);
            setEditing(null);
            setOpen(p.id);
          }}
        />
      )}
    </>
  );
}
