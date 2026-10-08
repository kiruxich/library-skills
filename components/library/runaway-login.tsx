"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Runaway Login — кнопка «Log in» убегает от курсора, пока форма пустая: на привязи к своему месту.
 * Одно поле заполнено — убегает вдвое ближе. Оба — защёлкивается дома и больше не двигается.
 * Шутка только над мышью: кнопка никогда не disabled, Tab до неё доходит и она останавливается,
 * Enter всегда отправляет форму.
 * Стек: React + TypeScript + Tailwind + Motion.
 */

const RADIUS = 95; // как близко курсор может подойти
const TRAVEL = 130; // максимальный вылет с пустой формой

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function Check() {
  return (
    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-[18px] flex-none place-items-center rounded-full bg-teal-400 text-[#06201c]">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </motion.span>
  );
}

export default function RunawayLogin() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const tray = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  const okEmail = isEmail(email), okPass = password.length >= 8;
  const filled = +okEmail + +okPass;
  const locked = filled === 2;
  const travel = locked ? 0 : filled === 1 ? TRAVEL / 2 : TRAVEL;

  const ox = useMotionValue(0), oy = useMotionValue(0);
  const x = useSpring(ox, { stiffness: 320, damping: 24 }), y = useSpring(oy, { stiffness: 320, damping: 24 });
  const tetherLen = useTransform(() => Math.hypot(x.get(), y.get()));
  const tetherAngle = useTransform(() => (Math.atan2(y.get(), x.get()) * 180) / Math.PI);

  const goHome = () => { ox.set(0); oy.set(0); };
  // Привязь укорачивается вместе с прогрессом формы.
  useEffect(() => {
    const len = Math.hypot(ox.get(), oy.get());
    if (len > travel) { const k = travel / len; ox.set(ox.get() * k); oy.set(oy.get() * k); }
  }, [travel, ox, oy]);

  const dodge = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || locked || status !== "idle" || !btn.current || !tray.current) return;
    const b = btn.current.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    let dx = cx - e.clientX, dy = cy - e.clientY;
    if (!dx && !dy) dx = Math.random() < 0.5 ? -1 : 1; // курсор ровно в центре — бежим вбок
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) return;
    const push = (RADIUS - dist) * 1.4;
    let nx = ox.get() + (dx / (dist || 1)) * push, ny = oy.get() + (dy / (dist || 1)) * push * 0.6;
    const len = Math.hypot(nx, ny);
    if (len > travel) {
      // Загнали в угол привязи — перескакиваем на другую сторону.
      const back = Math.hypot(ox.get(), oy.get()) >= travel - 4;
      const k = travel / len;
      nx *= back ? -k : k; ny *= back ? -k * 0.5 : k;
    }
    ox.set(nx); oy.set(ny);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!locked) return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1100);
  };

  const field = "flex items-center gap-2.5 rounded-xl border bg-white/[.03] px-3.5 py-3 transition focus-within:border-teal-400/70 focus-within:bg-teal-400/[.04] focus-within:shadow-[0_0_0_4px_rgba(45,212,191,.08)]";

  return (
    <form
      onSubmit={submit}
      onPointerMove={dodge}
      noValidate
      className="w-[400px] max-w-full rounded-[26px] border border-white/[.07] bg-[linear-gradient(180deg,#141c1b,#0d1312)] p-7 font-sans text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.04)]"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.3em] text-white/50">
        <span className="grid size-5 place-items-center rounded-full border border-teal-400/60"><span className="size-1.5 rounded-full bg-teal-400" /></span>
        TETHER
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div key="hi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="mx-auto grid size-14 place-items-center rounded-full bg-teal-400 text-[#06201c] shadow-[0_0_40px_rgba(45,212,191,.5)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </motion.div>
            <h3 className="mt-5 font-sans text-2xl font-bold">You&apos;re in</h3>
            <p className="mt-1 text-sm text-white/50">Welcome back, {email.split("@")[0]}.</p>
            <button type="button" onClick={() => { setStatus("idle"); setEmail(""); setPassword(""); setTried(false); }} className="mt-6 cursor-pointer text-xs text-teal-300/80 hover:text-teal-200">Выйти и попробовать снова</button>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -8 }}>
            <h3 className="mt-6 font-sans text-2xl font-bold tracking-tight">Sign in</h3>
            <p className="mt-1 text-sm leading-snug text-white/50">Welcome back. Two fields stand between you and that button.</p>

            <label htmlFor={`${id}-email`} className="mt-6 mb-1.5 block text-xs font-medium text-white/60">Email</label>
            <div className={`${field} ${tried && !okEmail ? "border-rose-400/50" : "border-white/10"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-none text-white/40"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              <input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
              {okEmail && <Check />}
            </div>

            <div className="mt-4 mb-1.5 flex justify-between text-xs font-medium">
              <label htmlFor={`${id}-pass`} className="text-white/60">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-300 no-underline hover:text-teal-200">Forgot?</a>
            </div>
            <div className={`${field} ${tried && !okPass ? "border-rose-400/50" : "border-white/10"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-none text-white/40"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              <input id={`${id}-pass`} type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="current-password" className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Скрыть пароль" : "Показать пароль"} className="flex-none cursor-pointer text-white/40 hover:text-white/70">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{!show && <path d="M3 3l18 18" />}</svg>
              </button>
              {okPass && <Check />}
            </div>
            {tried && !locked && <p className="mt-2 text-xs text-rose-300/80">{!okEmail ? "Нужен настоящий email." : "Пароль — минимум 8 символов."}</p>}

            {/* Лоток с кнопкой на привязи */}
            <div ref={tray} className="relative mt-6 grid h-[68px] place-items-center rounded-full bg-black/30 shadow-[inset_0_2px_10px_rgba(0,0,0,.5)]">
              <motion.span animate={{ opacity: locked ? 0 : 1 }} className="absolute h-11 w-32 rounded-full border border-dashed border-teal-400/40" />
              <motion.span
                className="absolute top-1/2 left-1/2 h-[2px] origin-left rounded-full bg-gradient-to-r from-teal-400/80 to-teal-300 shadow-[0_0_10px_rgba(45,212,191,.8)]"
                style={{ width: tetherLen, rotate: tetherAngle }}
              />
              <span className="absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full bg-teal-400/80" />
              <motion.button
                ref={btn}
                type="submit"
                onFocus={goHome}
                style={{ x, y }}
                animate={locked ? { backgroundColor: "#2dd4bf", color: "#05201b", boxShadow: "0 0 32px rgba(45,212,191,.55)" } : { backgroundColor: "#2a3331", color: "rgba(255,255,255,.85)", boxShadow: "0 8px 20px rgba(0,0,0,.45)" }}
                whileTap={{ scale: 0.96 }}
                className="relative z-10 flex h-11 w-32 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                {status === "loading" ? (
                  <motion.span className="size-4 rounded-full border-2 border-current border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                ) : (
                  <>{locked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}Log in</>
                )}
              </motion.button>
            </div>
            <p className="mt-4 text-center text-[11px] text-white/30">{locked ? "Готово — кнопка ваша." : filled ? "Ещё одно поле — и она перестанет убегать." : "Попробуйте поймать кнопку курсором 😉"}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
