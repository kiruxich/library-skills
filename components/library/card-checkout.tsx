"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";

/**
 * Card Checkout — карта повторяет ввод, переворачивается на CVC; после «Pay» перелетает в центр,
 * светится синим, пока банк «думает», и зелёным, когда оплата прошла.
 * Стек: React + TypeScript + Tailwind + Motion.
 */

type Stage = "form" | "auth" | "paid";

const TOTAL = "$1,248.00";
const digits = (s: string) => s.replace(/\D/g, "");
const brandOf = (n: string) => (/^4/.test(n) ? "VISA" : /^(5[1-5]|2[2-7])/.test(n) ? "MASTERCARD" : /^3[47]/.test(n) ? "AMEX" : "");
const luhn = (n: string) => {
  let sum = 0;
  for (let i = 0; i < n.length; i++) {
    let d = +n[n.length - 1 - i];
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return n.length >= 13 && sum % 10 === 0;
};
const groupNumber = (n: string) => n.replace(/(.{4})/g, "$1 ").trim();
const maskedNumber = (n: string) => groupNumber((n + "•".repeat(16)).slice(0, 16));

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}
const I = {
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  card: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20",
  cal: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  check: "M20 6 9 17l-5-5",
};

function CardFace({ number, name, expiry, cvc, flipped, glow }: { number: string; name: string; expiry: string; cvc: string; flipped: boolean; glow?: "blue" | "green" }) {
  const brand = brandOf(number);
  return (
    <div className="[perspective:1200px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className={`relative aspect-[1.586] w-full rounded-2xl transition-shadow duration-500 [transform-style:preserve-3d] ${
          glow === "blue" ? "shadow-[0_0_0_2px_rgba(99,102,241,.5),0_0_50px_8px_rgba(99,102,241,.45)]" : glow === "green" ? "shadow-[0_0_0_2px_rgba(34,197,94,.55),0_0_50px_8px_rgba(34,197,94,.4)]" : "shadow-[0_18px_40px_-14px_rgba(30,41,90,.45)]"
        }`}
      >
        {/* Лицевая сторона */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#e0e7ff_45%,#93a5f5_100%)] p-[7%] [backface-visibility:hidden]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[repeating-linear-gradient(115deg,transparent_0_9px,rgba(255,255,255,.35)_9px_10px)]" />
          {glow === "blue" && <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" initial={{ x: "-120%" }} animate={{ x: "320%" }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} />}
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <span className="block h-[22px] w-[30px] rounded-[5px] bg-[linear-gradient(135deg,#d6d3d1,#a8a29e)] ring-1 ring-black/10" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M8.5 16.5a5 5 0 0 0 0-9M12 19a9 9 0 0 0 0-14M15.5 21.5a13 13 0 0 0 0-19" /></svg>
            </div>
            <div className="text-right leading-none">
              <b className="block text-[11px] font-extrabold tracking-[.2em] text-indigo-900">SABLE</b>
              <span className="text-[7px] tracking-[.3em] text-indigo-900/60">RESERVE</span>
            </div>
          </div>
          <div className="relative mt-[11%] font-mono text-[clamp(13px,4.6cqw,19px)] font-semibold tracking-[.12em] text-slate-800 tabular-nums">{maskedNumber(number)}</div>
          <div className="relative mt-[7%] flex items-end justify-between">
            <div className="flex gap-5 text-[8px] font-semibold tracking-wider text-slate-500 uppercase">
              <div>Cardholder<b className="mt-0.5 block max-w-[130px] truncate text-[11px] tracking-normal text-slate-800">{name || "Your name"}</b></div>
              <div>Expires<b className="mt-0.5 block text-[11px] tracking-normal text-slate-800">{expiry || "••/••"}</b></div>
            </div>
            <span className="text-xs font-extrabold text-indigo-900 italic">{brand || " "}</span>
          </div>
        </div>
        {/* Оборот */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f1f5f9,#c7d2fe)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-[9%] h-[18%] bg-slate-900" />
          <div className="mx-[7%] mt-[7%] flex h-[16%] items-center justify-end rounded bg-[repeating-linear-gradient(90deg,#fff_0_6px,#f1f5f9_6px_12px)] pr-3">
            <span className="rounded bg-white px-2 font-mono text-sm font-bold text-slate-800 italic">{cvc ? cvc.padEnd(3, "•") : "•••"}</span>
          </div>
          <p className="mx-[7%] mt-3 text-[7px] leading-snug text-slate-500">This card is issued by Sable Reserve. Use is subject to the cardholder agreement. If found, please return to any branch.</p>
          <span className="absolute right-[7%] bottom-[8%] text-xs font-extrabold text-indigo-900 italic">{brandOf(number)}</span>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, aside, icon, error, children }: { label: string; aside?: React.ReactNode; icon: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase">
        <span>{label} {aside && <span className="ml-1 font-medium tracking-normal text-slate-400 normal-case">{aside}</span>}</span>
        {error && <span className="font-medium tracking-normal text-rose-500 normal-case">{error}</span>}
      </span>
      <span className={`flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 ${error ? "border-rose-300" : "border-slate-200"}`}>
        <Icon d={icon} className="flex-none text-slate-400" />
        {children}
      </span>
    </label>
  );
}

export default function CardCheckout() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [save, setSave] = useState(true);
  const [cvcFocus, setCvcFocus] = useState(false);
  const [tried, setTried] = useState(false);
  const [stage, setStage] = useState<Stage>("form");

  const [mm, yy] = expiry.split("/").map((s) => +s.trim());
  const now = new Date();
  const errors = {
    name: name.trim().length < 2 ? "Нужно имя" : "",
    number: !luhn(number) ? "Неверный номер" : "",
    expiry: !(mm >= 1 && mm <= 12 && yy >= 0) || new Date(2000 + yy, mm) <= now ? "Срок истёк?" : "",
    cvc: cvc.length < (brandOf(number) === "AMEX" ? 4 : 3) ? "3–4 цифры" : "",
  };
  const valid = !Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (tried ? errors[k] : "");

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    setStage("auth");
    setTimeout(() => setStage("paid"), 2200);
  };
  const reset = () => { setStage("form"); setTried(false); setCvcFocus(false); };
  const fill = () => { setName("A. HASIB"); setNumber("4242424242424242"); setExpiry("12 / 28"); setCvc("123"); };

  const last4 = number.slice(-4) || "4242";
  const card = <CardFace number={number} name={name} expiry={expiry.replace(/\s/g, "")} cvc={cvc} flipped={stage === "form" && cvcFocus} glow={stage === "auth" ? "blue" : stage === "paid" ? "green" : undefined} />;

  return (
    <div className="w-[760px] max-w-full overflow-hidden rounded-[22px] bg-white font-sans text-slate-900 shadow-[0_30px_70px_-20px_rgba(30,41,90,.35)] ring-1 ring-slate-200/70">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-extrabold tracking-[.14em]">
          <span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-white"><span className="size-3 rounded-full border-2 border-white" /></span>
          SABLE <span className="font-medium text-slate-400">CHECKOUT</span>
        </div>
        <ol className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          {["Your bag", "Delivery"].map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-emerald-600 text-white"><Icon d={I.check} className="size-2.5" /></span>{s}<span className="text-slate-300">—</span>
            </li>
          ))}
          <li className="flex items-center gap-1.5 border-b-2 border-indigo-600 pb-0.5 text-slate-900">
            <span className="grid size-4 place-items-center rounded-full bg-indigo-600 text-[9px] text-white">{stage === "paid" ? <Icon d={I.check} className="size-2.5" /> : 3}</span>Payment
          </li>
        </ol>
      </header>

      <LayoutGroup>
        <AnimatePresence mode="wait" initial={false}>
          {stage === "form" ? (
            <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid md:grid-cols-[1fr_1.15fr]">
              <div className="flex flex-col gap-5 bg-[linear-gradient(180deg,#f1f4fb,#e9edf7)] p-6 [container-type:inline-size]">
                <motion.div layoutId="sable-card" className="mx-auto w-full max-w-[300px]">{card}</motion.div>
                <div className="rounded-2xl bg-white/80 p-4 text-[12.5px] ring-1 ring-slate-200/70">
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400">YOUR ORDER</p>
                  <div className="flex justify-between font-medium"><span>Reserve membership</span><span>$1,180.00</span></div>
                  <p className="mb-2 text-[11px] text-slate-400">Annual · renews Aug 2027</p>
                  <div className="flex justify-between"><span>Priority delivery</span><span className="font-medium text-emerald-600">Included</span></div>
                  <div className="mt-1 flex justify-between"><span>Estimated tax</span><span>$68.00</span></div>
                  <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">Total due today</span><b className="text-lg">{TOTAL}</b></div>
                </div>
              </div>

              <form onSubmit={pay} noValidate className="flex flex-col gap-3.5 p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-sans text-xl font-bold tracking-tight">Payment details</h3>
                    <p className="text-[13px] text-slate-500">Enter your card to complete the transaction.</p>
                  </div>
                  <button type="button" onClick={fill} className="cursor-pointer rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200">Тест-карта</button>
                </div>
                <Field label="Cardholder name" icon={I.user} error={show("name")}>
                  <input value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="A. HASIB" autoComplete="cc-name" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300" />
                </Field>
                <Field label="Card number" icon={I.card} error={show("number")}>
                  <input value={groupNumber(number)} onChange={(e) => setNumber(digits(e.target.value).slice(0, 16))} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" className="w-full bg-transparent font-mono text-sm tracking-wider outline-none placeholder:text-slate-300" />
                  <span className="text-[11px] font-extrabold text-indigo-900 italic">{brandOf(number)}</span>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry date" icon={I.cal} error={show("expiry")}>
                    <input
                      value={expiry}
                      onChange={(e) => { const d = digits(e.target.value).slice(0, 4); setExpiry(d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d); }}
                      placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="CVC" aside="back of card" icon={I.lock} error={show("cvc")}>
                    <input value={cvc} onChange={(e) => setCvc(digits(e.target.value).slice(0, 4))} onFocus={() => setCvcFocus(true)} onBlur={() => setCvcFocus(false)} placeholder="•••" inputMode="numeric" autoComplete="cc-csc" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300" />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70">
                  <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-4 accent-indigo-600" />
                  <span className="text-[12.5px] leading-tight font-semibold">Save this card for next time<small className="block font-normal text-slate-400">Stored by Sable, never by the merchant</small></span>
                </label>
                <motion.button whileTap={{ scale: 0.98 }} className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#5b6cf0,#3f4fd8)] py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(63,79,216,.7)]">
                  <Icon d={I.lock} className="size-3.5" /> Pay {TOTAL} <span aria-hidden>→</span>
                </motion.button>
                <p className="flex gap-3 text-[11px] text-slate-400"><span>🛡 PCI-DSS Level 1</span><span>🔒 256-bit TLS</span><span className="hidden sm:inline">Sable never stores your CVC</span></p>
              </form>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-[470px] place-items-center bg-[linear-gradient(180deg,#f1f4fb,#e9edf7)] p-8">
              <div className="flex w-full max-w-[340px] flex-col items-center text-center [container-type:inline-size]">
                <motion.div layoutId="sable-card" transition={{ type: "spring", stiffness: 120, damping: 18 }} className="w-full">{card}</motion.div>
                <AnimatePresence mode="wait">
                  {stage === "auth" ? (
                    <motion.div key="auth" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-9 flex flex-col items-center">
                      <motion.span className="size-6 rounded-full border-2 border-indigo-200 border-t-indigo-600" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                      <b className="mt-3 text-[15px]">Authorising with your bank</b>
                      <span className="text-xs text-slate-500">{brandOf(number) || "Card"} •••• {last4} · {TOTAL}</span>
                    </motion.div>
                  ) : (
                    <motion.div key="paid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-9 flex flex-col items-center">
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }} className="grid size-7 place-items-center rounded-full bg-emerald-500 text-white">
                        <Icon d={I.check} className="size-4" />
                      </motion.span>
                      <b className="mt-3 text-[15px]">Paid {TOTAL}</b>
                      <span className="text-xs text-slate-500">{brandOf(number) || "Card"} •••• {last4} · receipt on its way to you</span>
                      <button onClick={reset} className="mt-4 cursor-pointer rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">Run it again</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
