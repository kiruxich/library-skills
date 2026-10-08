"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Lamp Login — тёмная комната, торшер и форма входа. Дёрните за шнурок (или нажмите на него) —
 * загорится свет, и форма проявится. «Sign In» тоже включает лампу. Вокруг летают светлячки.
 * Стек: React + TypeScript + Tailwind + Motion.
 */

const Y = "#facc15";

function Fireflies() {
  type Fly = { left: number; top: number; d: number; delay: number; dx: number; dy: number; s: number };
  const [flies, setFlies] = useState<Fly[]>([]);
  // Случайные позиции — только на клиенте, чтобы не разъехалась гидрация.
  useEffect(() => {
    setFlies(Array.from({ length: 18 }, () => ({
      left: Math.random() * 100, top: Math.random() * 100, d: 6 + Math.random() * 8, delay: Math.random() * 4,
      dx: (Math.random() - 0.5) * 60, dy: (Math.random() - 0.5) * 60, s: 2 + Math.random() * 2.5,
    })));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0">
      {flies.map((f, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.s, height: f.s, background: Y, boxShadow: `0 0 ${f.s * 4}px ${Y}` }}
          animate={{ x: [0, f.dx, 0], y: [0, f.dy, 0], opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: f.d, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Lamp({ on, toggle }: { on: boolean; toggle: () => void }) {
  const pulled = useRef(false); // после рывка браузер может прислать ещё и click — не переключаем дважды
  return (
    <div className="relative h-[380px] w-[260px] flex-none">
      {/* Конус света */}
      <motion.div
        className="pointer-events-none absolute top-[62px] left-1/2 h-[300px] w-[300px] -translate-x-1/2"
        style={{ clipPath: "polygon(36% 0, 64% 0, 100% 100%, 0 100%)", background: "linear-gradient(180deg, rgba(250,204,21,.55), rgba(250,204,21,.12) 70%, transparent)" }}
        initial={false}
        animate={on ? { opacity: [0, 0.8, 0.3, 1] } : { opacity: 0 }}
        transition={{ duration: on ? 0.5 : 0.2, times: on ? [0, 0.25, 0.45, 1] : undefined }}
      />
      <motion.div className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-[300px] -translate-x-1/2 rounded-[50%] bg-yellow-300/30 blur-xl" initial={false} animate={{ opacity: on ? 1 : 0 }} />

      {/* Абажур */}
      <div className="absolute top-6 left-1/2 h-[44px] w-[120px] -translate-x-1/2 rounded-t-[60px] bg-[linear-gradient(180deg,#2b2925,#141310)] shadow-[inset_0_2px_0_rgba(255,255,255,.08)]" />
      <motion.div className="absolute top-[64px] left-1/2 h-[8px] w-[96px] -translate-x-1/2 rounded-[50%]" initial={false} animate={{ backgroundColor: on ? "#fff7d1" : "#3a372f", boxShadow: on ? "0 0 30px 10px rgba(250,204,21,.6)" : "0 0 0 0 rgba(0,0,0,0)" }} />
      {/* Стойка и основание */}
      <div className="absolute top-[68px] bottom-[14px] left-1/2 w-[4px] -translate-x-1/2 bg-[linear-gradient(90deg,#1c1b18,#3a3833,#1c1b18)]" />
      <div className="absolute bottom-0 left-1/2 h-[14px] w-[84px] -translate-x-1/2 rounded-t-md bg-[linear-gradient(180deg,#2b2925,#111)]" />

      {/* Шнурок */}
      <div className="absolute top-[58px] left-[calc(50%+40px)] flex flex-col items-center">
        <motion.button
          type="button"
          aria-label={on ? "Выключить лампу" : "Включить лампу"}
          aria-pressed={on}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.35}
          dragSnapToOrigin
          onDragEnd={(_, info) => { if (info.offset.y > 14) { pulled.current = true; toggle(); setTimeout(() => (pulled.current = false), 50); } }}
          onClick={() => !pulled.current && toggle()}
          className="flex cursor-grab touch-none flex-col items-center outline-none active:cursor-grabbing"
          whileHover={{ rotate: [0, 3, -3, 0] }}
        >
          <span className="h-[70px] w-px bg-white/30" />
          <span className="h-[14px] w-[8px] rounded-[3px] bg-[linear-gradient(180deg,#e8d9a8,#b59b5a)] shadow-[0_0_8px_rgba(250,204,21,.3)]" />
        </motion.button>
      </div>
    </div>
  );
}

function Input({ icon, ...props }: { icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2.5 rounded-xl border border-white/[.06] bg-black/40 px-3.5 py-3 transition focus-within:border-yellow-400/60">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-white/40"><path d={icon} /></svg>
      <input {...props} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
    </label>
  );
}

export default function LampLogin() {
  const [on, setOn] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [user, setUser] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOn(true);
    setLoading(true);
    setTimeout(() => { setLoading(false); setWelcome(true); }, 2000);
  };

  return (
    <div className="relative w-[860px] max-w-full overflow-hidden rounded-[28px] bg-[radial-gradient(120%_90%_at_25%_30%,#1d1b16,#0b0a08_70%)] font-sans text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)]">
      <Fireflies />
      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_25%_55%,rgba(250,204,21,.14),transparent_70%)]" initial={false} animate={{ opacity: on ? 1 : 0 }} />
      <div className="relative flex flex-col items-center justify-around gap-6 px-6 py-8 md:flex-row md:px-10">
        <Lamp on={on} toggle={() => setOn((v) => !v)} />

        <motion.form
          onSubmit={submit}
          initial={false}
          animate={{ opacity: on ? 1 : 0.35, filter: on ? "blur(0px)" : "blur(1.5px)", boxShadow: on ? "0 0 60px -10px rgba(250,204,21,.25)" : "0 0 0 0 rgba(0,0,0,0)" }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[340px] rounded-[22px] border border-white/10 bg-white/[.04] p-7 backdrop-blur-md"
        >
          <AnimatePresence mode="wait" initial={false}>
            {welcome ? (
              <motion.div key="hi" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                <div className="text-4xl">💡</div>
                <h3 className="mt-3 font-sans text-2xl font-bold">Lights on, {user || "friend"}</h3>
                <p className="mt-1 text-sm text-white/50">You&apos;re signed in.</p>
                <button type="button" onClick={() => setWelcome(false)} className="mt-6 cursor-pointer text-xs text-yellow-300/80 hover:text-yellow-200">Назад к форме</button>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col gap-3">
                <div className="mb-2 text-center">
                  <h3 className="font-sans text-[26px] font-extrabold tracking-tight">Welcome Back</h3>
                  <p className="text-xs text-white/50">{on ? "Enter your details to access your account" : "Too dark to type? Pull the cord."}</p>
                </div>
                <Input icon="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
                <Input icon="M3 5h18v14H3zM22 7l-10 6L2 7" placeholder="Email Address" type="email" autoComplete="email" />
                <div className="relative">
                  <Input icon="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" placeholder="Password" type={showPass ? "text" : "password"} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? "Скрыть пароль" : "Показать пароль"} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white/70">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{!showPass && <path d="M3 3l18 18" />}</svg>
                  </button>
                </div>
                <motion.button whileTap={{ scale: 0.98 }} className="mt-2 flex h-11 cursor-pointer items-center justify-center rounded-xl bg-yellow-400 text-sm font-bold text-black shadow-[0_8px_24px_-6px_rgba(250,204,21,.6)] hover:bg-yellow-300">
                  {loading ? <motion.span className="size-4 rounded-full border-2 border-black border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} /> : "Sign In"}
                </motion.button>
                <div className="my-2 flex items-center gap-3 text-[10px] font-semibold tracking-wider text-white/35"><span className="h-px flex-1 bg-white/10" />OR CONTINUE WITH<span className="h-px flex-1 bg-white/10" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] py-2.5 text-xs font-semibold hover:bg-white/[.08]">
                    <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                    Google
                  </button>
                  <button type="button" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] py-2.5 text-xs font-semibold hover:bg-white/[.08]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" /></svg>
                    GitHub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}
