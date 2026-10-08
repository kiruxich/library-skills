"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * OTP Orbit — после последней цифры ряд сворачивается на орбиту, делает полтора оборота
 * вокруг центра и «вкручивается» в одну зелёную плитку. Цвет — только для вердикта:
 * внимание подсвечивается светом, зелёный появляется, когда код подтверждён.
 * Стек: React + TypeScript + Tailwind + Motion.
 */

type Phase = "input" | "orbit" | "spin" | "screw" | "done" | "error";

// Демо: SMS «приходит» с этим кодом, а принимается любой код, кроме 0000. Подставьте свой API.
const SMS_CODE = "4729";
const verifyDemo = (code: string) => new Promise<boolean>((r) => setTimeout(() => r(code !== "0000"), 250));

const ROW = [-93, -31, 31, 93].map((x) => ({ x, y: 0 }));
const R = 62;
const ORBIT = [-90, 0, 90, 180].map((a) => ({ x: Math.cos((a * Math.PI) / 180) * R, y: Math.sin((a * Math.PI) / 180) * R }));

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

export default function OtpOrbit() {
  const [phase, setPhase] = useState<Phase>("input");
  const [sms, setSms] = useState(false);
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const otp = useOtp(4, async (code) => {
    setSms(false);
    if (!(await verifyDemo(code))) {
      setPhase("error");
      later(800, () => { setPhase("input"); otp.reset(); });
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur();
    setPhase("orbit");
    later(450, () => setPhase("spin"));
    later(1650, () => setPhase("screw"));
    later(2250, () => setPhase("done"));
  });

  // «Входящая SMS» через секунду после открытия — как подсказка клавиатуры iOS.
  useEffect(() => {
    const t = setTimeout(() => setSms(true), 1200);
    return () => { clearTimeout(t); timers.current.forEach(clearTimeout); };
  }, []);

  const restart = () => { setPhase("input"); otp.reset(); later(900, () => setSms(true)); };
  const onRing = phase === "orbit" || phase === "spin";
  const green = phase === "spin" || phase === "screw" || phase === "done";
  const pos = (i: number) => (phase === "input" || phase === "error" ? ROW[i] : onRing ? ORBIT[i] : { x: 0, y: 0 });
  const turn = phase === "spin" ? 450 : phase === "screw" || phase === "done" ? 630 : 0;

  return (
    <div className="flex w-[400px] max-w-full flex-col items-center gap-4 font-sans">
      <div className="w-full rounded-[24px] border border-white/[.07] bg-[linear-gradient(180deg,#171c25,#11151c)] px-6 py-7 text-white shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "done" ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h3 className="font-sans text-lg font-semibold text-emerald-400">Verified successfully</h3>
              <p className="mt-1 text-[13px] text-white/45">Your number is confirmed. You&apos;re all set.</p>
            </motion.div>
          ) : (
            <motion.div key="ask" exit={{ opacity: 0, y: -6 }} className="text-center">
              <h3 className="font-sans text-lg font-semibold">Verify your number</h3>
              <p className="mt-1 text-[13px] text-white/45">Enter the 4-digit code we sent to +1 ••• ••• 0429</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative mx-auto my-5 h-[170px] w-full"
          animate={phase === "error" ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Орбита */}
          <motion.div
            className="pointer-events-none absolute top-1/2 left-1/2 rounded-full border border-dashed"
            style={{ width: R * 2, height: R * 2, marginLeft: -R, marginTop: -R }}
            initial={false}
            animate={{ opacity: onRing ? 1 : 0, scale: onRing ? 1 : 0.6, borderColor: green ? "rgba(52,211,153,.45)" : "rgba(255,255,255,.18)" }}
            transition={{ duration: 0.35 }}
          />
          <motion.span className="absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-white/40" initial={false} animate={{ opacity: onRing ? 1 : 0 }} />

          <motion.div
            className="absolute top-1/2 left-1/2 size-0"
            initial={false}
            animate={{ rotate: turn }}
            transition={phase === "spin" ? { duration: 1.15, ease: [0.65, 0, 0.35, 1] } : { duration: 0.55, ease: [0.5, 0, 0.75, 0] }}
          >
            {otp.digits.map((d, i) => (
              <motion.div
                key={i}
                className={`absolute -mt-[26px] -ml-[25px] h-[52px] w-[50px] rounded-[13px] border transition-[border-color,box-shadow,background-color] duration-300 ${
                  phase === "error" ? "border-rose-400/80 bg-rose-400/5"
                    : green ? "border-emerald-400/80 bg-emerald-400/10 shadow-[0_0_18px_rgba(52,211,153,.3)]"
                    : d ? "border-white/35 bg-white/[.06]" : "border-white/12 bg-white/[.03] focus-within:border-white/60 focus-within:shadow-[0_0_24px_rgba(255,255,255,.18)]"
                }`}
                initial={false}
                animate={{ ...pos(i), scale: phase === "screw" || phase === "done" ? 0.2 : 1, opacity: phase === "screw" || phase === "done" ? 0 : 1 }}
                transition={phase === "screw" ? { duration: 0.5, ease: [0.5, 0, 0.75, 0] } : { type: "spring", stiffness: 240, damping: 22, delay: phase === "orbit" ? i * 0.05 : 0 }}
              >
                <input {...otp.bind(i)} readOnly={phase !== "input"} className="size-full bg-transparent text-center text-xl font-semibold text-white caret-white outline-none" />
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence>
            {phase === "done" && (
              <motion.div
                initial={{ scale: 0.3, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="absolute top-1/2 left-1/2 -mt-8 -ml-8 grid size-16 place-items-center rounded-[18px] border border-emerald-400/80 bg-emerald-400/10 shadow-[0_0_40px_rgba(52,211,153,.35)]"
              >
                <span className="absolute -inset-3 rounded-[24px] border border-emerald-400/20" />
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.35 }} />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {phase === "done" ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
            <span className="text-xs text-emerald-400/80">🔒 Secured with one-time code</span>
            <button onClick={restart} className="w-full cursor-pointer rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400">Continue</button>
          </motion.div>
        ) : (
          <p className="text-center text-xs text-white/35">
            {phase === "error" ? <span className="text-rose-400">That code didn&apos;t match. Try again.</span> : <>Didn&apos;t get it? <button className="cursor-pointer font-semibold text-white/70 hover:text-white">Resend code</button></>}
          </p>
        )}
      </div>

      {/* Подсказка «Из Сообщений», как у клавиатуры iOS */}
      <AnimatePresence>
        {sms && phase === "input" && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => otp.fill(SMS_CODE)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/[.07] bg-[#1b212b] px-4 py-2.5 text-left text-white"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-500 text-sm">💬</span>
            <span className="text-[12px] leading-tight text-white/50">From Messages<b className="block font-mono text-[15px] tracking-[.3em] text-white">{SMS_CODE}</b></span>
            <span className="ml-auto text-[11px] text-white/35">нажмите, чтобы вставить</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
