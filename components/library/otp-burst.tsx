"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * OTP Burst — четыре ячейки с тёплой подсветкой. Последняя цифра собирает их в сетку,
 * связывает линиями, сплющивает в одну плитку и взрывает зелёными частицами в «Verified».
 * Стек: React + TypeScript + Tailwind + Motion.
 */

type Phase = "input" | "grid" | "merge" | "burst" | "done" | "error";

// Демо-проверка: подходит любой код, кроме 0000. Подставьте свой запрос к API.
const verifyDemo = (code: string) => new Promise<boolean>((r) => setTimeout(() => r(code !== "0000"), 250));

const ROW = [-96, -32, 32, 96].map((x) => ({ x, y: 0 }));
const GRID = [{ x: -34, y: -34 }, { x: -34, y: 34 }, { x: 34, y: -34 }, { x: 34, y: 34 }];

/** Общая логика ввода кода из N ячеек: автопереход, Backspace, стрелки, вставка из буфера. */
function useOtp(length: number, onComplete: (code: string) => void) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setDigits(next);
    if (next.every(Boolean)) onComplete(next.join(""));
  };
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const fill = (code: string) => {
    const next = code.replace(/\D/g, "").slice(0, length).split("");
    commit([...next, ...Array(length - next.length).fill("")]);
    focus(next.length);
  };

  const bind = (i: number) => ({
    ref: (el: HTMLInputElement | null) => { refs.current[i] = el; },
    value: digits[i],
    inputMode: "numeric" as const,
    autoComplete: i === 0 ? "one-time-code" : "off",
    maxLength: length,
    "aria-label": `Цифра ${i + 1}`,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "");
      if (v.length > 1) return fill(digits.slice(0, i).join("") + v); // вставка или автозаполнение из SMS
      const next = [...digits];
      next[i] = v;
      commit(next);
      if (v) focus(i + 1);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[i]) { e.preventDefault(); const next = [...digits]; next[i - 1] = ""; setDigits(next); focus(i - 1); }
      if (e.key === "ArrowLeft") focus(i - 1);
      if (e.key === "ArrowRight") focus(i + 1);
    },
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
  });

  const reset = () => { setDigits(Array(length).fill("")); setTimeout(() => focus(0)); };
  return { digits, bind, fill, reset, focus };
}

function Particles() {
  const parts = useMemo(
    () => Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2 + Math.random() * 0.4, d = 70 + Math.random() * 110;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 4 + Math.random() * 7, sq: i % 3 === 0, delay: Math.random() * 0.08 };
    }),
    [],
  );
  return (
    <>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute top-1/2 left-1/2 bg-emerald-400 ${p.sq ? "rounded-[2px]" : "rounded-full"}`}
          style={{ width: p.s, height: p.s, marginLeft: -p.s / 2, marginTop: -p.s / 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.sq ? 180 : 0 }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </>
  );
}

export default function OtpBurst() {
  const [phase, setPhase] = useState<Phase>("input");
  const [left, setLeft] = useState(30);
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const otp = useOtp(4, async (code) => {
    if (!(await verifyDemo(code))) {
      setPhase("error");
      later(700, () => { setPhase("input"); otp.reset(); });
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur();
    setPhase("grid");
    later(750, () => setPhase("merge"));
    later(1250, () => setPhase("burst"));
    later(2100, () => setPhase("done"));
  });

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const restart = () => { setPhase("input"); setLeft(30); otp.reset(); };
  const pos = (i: number) => (phase === "input" || phase === "error" ? ROW[i] : phase === "grid" ? GRID[i] : { x: 0, y: 0 });
  const verified = phase === "burst" || phase === "done";

  return (
    <div className="w-[380px] max-w-full rounded-[26px] border border-white/8 bg-[#161616] px-6 pt-3 pb-6 font-sans text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]">
      <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/15" />

      <AnimatePresence mode="wait" initial={false}>
        {verified ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h3 className="font-sans text-xl font-semibold text-emerald-400">Verified Successfully</h3>
            <p className="mt-1 text-[13px] text-white/45">Your number has been verified.</p>
          </motion.div>
        ) : (
          <motion.div key="ask" exit={{ opacity: 0, y: -8 }} className="text-center">
            <h3 className="font-sans text-xl font-semibold">Let&apos;s verify your number</h3>
            <p className="mt-1 text-[13px] leading-snug text-white/45">We&apos;ve sent a 4-digit code to your phone.<br />It&apos;ll auto-verify once entered.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative mx-auto my-6 h-[150px] w-full"
        animate={phase === "error" ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Линии между ячейками в фазе сетки */}
        <svg className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="120" height="120" viewBox="-60 -60 120 120">
          <motion.rect
            x="-34" y="-34" width="68" height="68" rx="2" fill="none" stroke="#ff7a45" strokeWidth="1.5"
            initial={false}
            animate={{ pathLength: phase === "grid" ? 1 : 0, opacity: phase === "grid" ? 0.9 : 0 }}
            transition={{ duration: 0.45, delay: phase === "grid" ? 0.25 : 0 }}
          />
        </svg>

        {otp.digits.map((d, i) => {
          const hot = phase === "error" ? "border-rose-500 shadow-[0_0_18px_rgba(244,63,94,.35)]" : d || phase !== "input" ? "border-[#ff7a45] shadow-[0_0_18px_rgba(255,122,69,.28)]" : "border-white/12 focus-within:border-[#ff7a45] focus-within:shadow-[0_0_22px_rgba(255,122,69,.45)]";
          return (
            <motion.div
              key={i}
              className={`absolute top-1/2 left-1/2 -mt-7 -ml-[26px] h-14 w-[52px] overflow-hidden rounded-[14px] border bg-[#1d1d1d] transition-[border-color,box-shadow] ${hot}`}
              initial={false}
              animate={{ ...pos(i), scale: phase === "merge" ? 1.55 : 1, opacity: verified ? 0 : 1, borderRadius: phase === "merge" ? 22 : 14 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: phase === "grid" ? i * 0.04 : 0 }}
            >
              <input
                {...otp.bind(i)}
                readOnly={phase !== "input"}
                className={`size-full bg-transparent text-center text-xl font-semibold caret-[#ff7a45] outline-none transition-opacity ${phase === "merge" ? "opacity-0" : ""}`}
              />
            </motion.div>
          );
        })}

        {(phase === "burst" || phase === "done") && <Particles />}
        <AnimatePresence>
          {verified && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
              className="absolute top-1/2 left-1/2 -mt-6 -ml-6 grid size-12 place-items-center rounded-[14px] border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_30px_rgba(52,211,153,.35)]"
            >
              <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.35 }} />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {phase === "done" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 text-[13px]">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">🔒 Verified and Secure</span>
          <button onClick={restart} className="cursor-pointer text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline">Проверить ещё раз</button>
        </motion.div>
      ) : (
        <p className={`text-center text-[13px] text-white/40 transition-opacity ${verified ? "opacity-0" : ""}`}>
          {phase === "error" ? <span className="text-rose-400">Код не подошёл — попробуйте ещё раз</span> : (
            <>Didn&apos;t receive the code?{" "}
              {left > 0 ? <span className="text-white/60">Resend in 0:{String(left).padStart(2, "0")}</span>
                : <button onClick={() => setLeft(30)} className="cursor-pointer font-semibold text-white hover:text-[#ff7a45]">Resend</button>}
            </>
          )}
        </p>
      )}
      <p className="mt-3 text-center text-[11px] text-white/25">Демо: подходит любой код, кроме 0000</p>
    </div>
  );
}
