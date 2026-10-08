"use client";

import { AnimatePresence, animate, motion, useAnimationControls, useMotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Basketball Upload — файл-«мяч» оттягивается как рогатка, пунктир показывает траекторию,
 * попадание в кольцо запускает загрузку. Файлы, брошенные мышью на карточку, грузятся сразу.
 * Стек: React + TypeScript + Tailwind + Motion.
 */

type Ball = { name: string; size: number; ext: string; file?: File };
type Row = { id: number; name: string; size: number; progress: number };

const DEMO: Ball = { name: "document.pdf", size: 2.4 * 1024 * 1024, ext: "PDF" };
const BW = 56, BH = 70; // размер карточки-мяча
const G = 1700; // гравитация, px/s²
const V_MIN = 700, V_MAX = 1350; // скорость броска, px/s
const MAX_PULL = 150;

const toBall = (f: File): Ball => ({ name: f.name, size: f.size, ext: (f.name.split(".").pop() || "file").slice(0, 4).toUpperCase(), file: f });
const fmt = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function useSfx(muted: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  return useCallback(
    (kind: "swish" | "rim") => {
      if (muted || typeof window === "undefined") return;
      const ac = (ctx.current ??= new AudioContext());
      const t = ac.currentTime;
      if (kind === "swish") {
        const len = 0.35, buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
        const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        src.buffer = buf; f.type = "bandpass"; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(700, t + len);
        g.gain.value = 0.35; src.connect(f).connect(g).connect(ac.destination); src.start();
      } else {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "triangle"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.15);
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.connect(g).connect(ac.destination); o.start(); o.stop(t + 0.2);
      }
    },
    [muted],
  );
}

export default function BasketballUpload() {
  const court = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const net = useAnimationControls();

  const x = useMotionValue(0), y = useMotionValue(0), scale = useMotionValue(1), rotate = useMotionValue(0), opacity = useMotionValue(1);
  const [home, setHome] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<"idle" | "aim" | "flight">("idle");
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [queue, setQueue] = useState<Ball[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [uploaded, setUploaded] = useState(2);
  const [muted, setMuted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const sfx = useSfx(muted);
  const ball = queue[0] ?? DEMO;
  const drag = useRef<{ px: number; py: number } | null>(null);
  const idle = useRef(true);
  idle.current = phase === "idle";

  // «Дом» мяча — снизу слева от центра; пересчитываем при ресайзе.
  useEffect(() => {
    const el = court.current!;
    const place = () => {
      const h = { x: el.clientWidth * 0.5 - BW / 2 - 70, y: el.clientHeight - BH - 56 };
      setHome(h);
      if (idle.current) { x.set(h.x); y.set(h.y); }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [x, y]);

  const hoop = () => {
    const c = court.current!.getBoundingClientRect(), r = rim.current!.getBoundingClientRect();
    return { y: r.top - c.top + r.height / 2, l: r.left - c.left, r: r.right - c.left };
  };

  // Направление — от точки оттяжки к «дому», сила — база плюс доля оттяжки.
  const velocity = (px: number, py: number) => {
    const dx = home.x - px, dy = home.y - py, len = Math.hypot(dx, dy);
    if (len < 1) return { vx: 0, vy: 0 };
    const speed = V_MIN + (V_MAX - V_MIN) * Math.min(1, len / MAX_PULL);
    return { vx: (dx / len) * speed, vy: (dy / len) * speed };
  };

  const startUpload = useCallback((b: Ball) => {
    const id = Date.now();
    setRows((r) => [{ id, name: b.name, size: b.size, progress: 0 }, ...r].slice(0, 2));
    const t0 = performance.now(), dur = 1700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      setRows((r) => r.map((row) => (row.id === id ? { ...row, progress: Math.round(eased * 100) } : row)));
      if (p < 1) requestAnimationFrame(tick);
      else setUploaded((n) => n + 1);
    };
    requestAnimationFrame(tick);
  }, []);

  const goHome = (fresh: boolean) => {
    rotate.set(0);
    if (fresh) {
      x.set(home.x); y.set(home.y); scale.set(0.6);
      animate(scale, 1, { type: "spring", stiffness: 300, damping: 18 });
      animate(opacity, 1, { duration: 0.25 });
    } else {
      animate(x, home.x, { type: "spring", stiffness: 260, damping: 24 });
      animate(y, home.y, { type: "spring", stiffness: 260, damping: 24 });
      animate(scale, 1, { duration: 0.3 });
    }
    setPhase("idle");
  };

  const shoot = (vx: number, vy: number) => {
    setPhase("flight");
    setDots([]);
    sfx("swish");
    const h = hoop(), startCy = y.get() + BH / 2;
    let px = x.get(), py = y.get(), last = performance.now(), depth = 0, scored = false, t = 0;
    const thrown = ball;
    const frame = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now; t += dt;
      const prevCy = py + BH / 2;
      vy += G * dt; px += vx * dt; py += vy * dt;
      const cx = px + BW / 2, cy = py + BH / 2;
      depth = Math.max(depth, Math.min(1, (startCy - cy) / Math.max(1, startCy - h.y)));
      scale.set(1 - 0.45 * depth);
      rotate.set(rotate.get() + vx * dt * 0.6);
      x.set(px); y.set(py);

      if (!scored && vy > 0 && prevCy < h.y && cy >= h.y) {
        const pad = 10;
        if (cx > h.l + pad && cx < h.r - pad) {
          scored = true;
          vx *= 0.15; vy = Math.min(vy, 260);
          net.start({ scaleY: [1, 1.22, 0.95, 1], transition: { duration: 0.5 } });
          setTimeout(() => sfx("rim"), 60);
        } else if (cx > h.l - 16 && cx < h.r + 16) {
          vy = -vy * 0.45; vx += cx < (h.l + h.r) / 2 ? -140 : 140; // отскок от дужки
          sfx("rim");
        }
      }
      if (scored) opacity.set(Math.max(0, opacity.get() - dt * 3.2));

      const el = court.current!;
      if (scored && opacity.get() <= 0) {
        startUpload(thrown);
        setQueue((q) => q.slice(1));
        goHome(true);
        return;
      }
      if (!scored && (cy > el.clientHeight + 60 || cx < -80 || cx > el.clientWidth + 80 || (vy > 0 && cy > startCy + 30) || t > 3)) {
        goHome(false);
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const trajectory = (px: number, py: number) => {
    const { vx: raw, vy } = velocity(px, py);
    const vx = assist(px, py, raw, vy);
    return Array.from({ length: 16 }, (_, i) => {
      const t = (i + 1) * 0.045;
      return { x: px + BW / 2 + vx * t, y: py + BH / 2 + vy * t + 0.5 * G * t * t };
    });
  };

  const onDown = (e: React.PointerEvent) => {
    if (phase !== "idle") return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX - x.get(), py: e.clientY - y.get() };
    setPhase("aim");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const nx = e.clientX - drag.current.px, ny = e.clientY - drag.current.py;
    x.set(nx); y.set(ny);
    rotate.set((nx - home.x) * -0.08);
    setDots(Math.hypot(nx - home.x, ny - home.y) > 14 ? trajectory(nx, ny) : []);
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    const px = x.get(), py = y.get();
    if (Math.hypot(px - home.x, py - home.y) < 14) { setDots([]); goHome(false); return; }
    const { vx, vy } = velocity(px, py);
    shoot(assist(px, py, vx, vy), vy);
  };

  // Доводчик: если траектория и так почти в кольце, подправляем горизонталь, чтобы попасть.
  const assist = (px: number, py: number, vx: number, vy: number) => {
    const h = hoop(), cx = px + BW / 2, cy = py + BH / 2, mid = (h.l + h.r) / 2;
    const disc = vy * vy + 2 * G * (h.y - cy);
    if (disc < 0) return vx;
    const t = (-vy + Math.sqrt(disc)) / G; // момент, когда мяч падает на уровень кольца
    const miss = cx + vx * t - mid;
    return Math.abs(miss) < 120 ? vx - miss / t : vx;
  };

  // С клавиатуры — идеальный бросок: решаем баллистику до центра кольца.
  const autoShot = () => {
    if (phase !== "idle") return;
    const h = hoop(), cx = home.x + BW / 2, cy = home.y + BH / 2;
    const dy = h.y - 40 - cy, T = Math.sqrt((2 * -dy) / G) + 0.18;
    const vy = (h.y - cy - 0.5 * G * T * T) / T, vx = ((h.l + h.r) / 2 - cx) / T;
    shoot(vx, vy);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    [...e.dataTransfer.files].forEach((f, i) => setTimeout(() => startUpload(toBall(f)), i * 250));
  };

  const active = rows[0];

  return (
    <div
      className="relative w-[400px] max-w-full rounded-[28px] bg-white p-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,.05),0_20px_50px_-12px_rgba(15,23,42,.18)] select-none"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-lg font-semibold tracking-tight">Upload files</h3>
          <p className="text-[13px] text-slate-500">Drag and drop, or take the shot.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Включить звук" : "Выключить звук"}
            className="grid size-8 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
            </svg>
          </button>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Uploaded <motion.b key={uploaded} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block text-slate-900">{uploaded}</motion.b>
          </span>
        </div>
      </div>

      <div ref={court} className="relative mt-4 h-[420px]">
        {/* Дропзона */}
        <button
          onClick={() => input.current?.click()}
          className={`absolute inset-x-0 top-0 h-[190px] cursor-pointer rounded-2xl border-2 border-dashed transition-colors ${dragOver ? "border-indigo-400 bg-indigo-50/60" : "border-slate-200 bg-slate-50/40 hover:border-slate-300"}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {active ? (
              <motion.div key={active.id} initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-3 top-3 rounded-xl bg-white p-3 text-left shadow-[0_4px_16px_-4px_rgba(15,23,42,.15)]">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">{active.name.split(".").pop()?.toUpperCase()}</span>
                  <span className="truncate font-medium">{active.name}</span>
                  <span className={`ml-auto text-xs font-semibold ${active.progress === 100 ? "text-emerald-600" : "text-indigo-600"}`}>{active.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-colors ${active.progress === 100 ? "bg-emerald-500" : "bg-indigo-600"}`} style={{ width: `${active.progress}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px]">
                  {active.progress === 100 ? <span className="font-medium text-emerald-600">✓ File uploaded successfully</span> : <span className="text-indigo-600">Uploading file…</span>}
                  <span className="text-slate-400">{fmt(active.size)}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pt-7">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-700"><path d="M12 15V3m-5 5 5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
                <span className="mt-2 text-sm font-semibold">Drop files here</span>
                <span className="text-xs text-slate-400">or take the shot</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <input ref={input} type="file" multiple hidden onChange={(e) => { const fs = [...(e.target.files || [])]; if (fs.length) setQueue((q) => [...q, ...fs.map(toBall)]); e.target.value = ""; }} />

        {/* Щит */}
        <div className="pointer-events-none absolute top-[118px] left-1/2 h-[64px] w-[92px] -translate-x-1/2 rounded-md border border-slate-300 bg-white shadow-sm">
          <div className="absolute top-2.5 left-1/2 h-[30px] w-[42px] -translate-x-1/2 rounded-[3px] border-2 border-indigo-600" />
        </div>
        {/* Кольцо и сетка — поверх мяча, чтобы он проходил «сквозь» */}
        <div className="pointer-events-none absolute top-[166px] left-1/2 z-20 -translate-x-1/2">
          <div ref={rim} className="relative mx-auto h-[12px] w-[78px] rounded-[50%] border-[3px] border-indigo-600 bg-indigo-600/10" />
          <motion.svg animate={net} style={{ originY: 0 }} width="70" height="58" viewBox="0 0 70 58" className="mx-auto -mt-1.5 block" fill="none" stroke="#64748b" strokeWidth="1.1">
            {[0, 10, 20, 30, 40, 50, 60, 70].map((x0, i) => <path key={i} d={`M${x0} 0 Q ${35 + (x0 - 35) * 0.55} 30 ${35 + (x0 - 35) * 0.45} 56`} />)}
            {[12, 26, 40, 52].map((yy, i) => <path key={i} d={`M${3 + yy * 0.18} ${yy} Q35 ${yy + 4} ${67 - yy * 0.18} ${yy}`} />)}
          </motion.svg>
        </div>

        {/* Траектория */}
        {dots.map((d, i) => (
          <span key={i} className="pointer-events-none absolute z-10 rounded-full bg-indigo-500" style={{ left: d.x - 2.5, top: d.y - 2.5, width: 5 - i * 0.18, height: 5 - i * 0.18, opacity: 1 - i / 18 }} />
        ))}

        {/* Мяч-файл */}
        <motion.div
          role="button"
          tabIndex={0}
          aria-label={`Бросить ${ball.name} в корзину`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), autoShot())}
          style={{ x, y, scale, rotate, opacity, width: BW, height: BH }}
          className={`absolute top-0 left-0 z-10 touch-none rounded-lg bg-white shadow-[0_6px_20px_-4px_rgba(15,23,42,.25)] ring-1 ring-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${phase === "aim" ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <span className="absolute top-0 right-0 size-3 rounded-bl-[4px] bg-slate-200" />
          <span className="absolute top-3 left-2 h-[3px] w-6 rounded bg-slate-200" />
          <span className="absolute top-[18px] left-2 h-[3px] w-8 rounded bg-slate-200" />
          <span className="absolute top-6 left-2 h-[3px] w-5 rounded bg-slate-200" />
          <span className="absolute bottom-2.5 left-2 rounded-[4px] bg-indigo-600 px-1.5 py-[2px] text-[8px] font-bold text-white">{ball.ext}</span>
          {queue.length > 1 && <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{queue.length}</span>}
        </motion.div>

        <p className="absolute inset-x-0 bottom-0 text-center text-xs text-slate-400">Aim the file &amp; release to shoot into the basket</p>
      </div>
    </div>
  );
}
