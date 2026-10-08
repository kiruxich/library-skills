"use client";

import { useEffect, useRef } from "react";

/**
 * Scanner Testimonials — две ленты отзывов едут навстречу друг другу, а золотой луч
 * «сканирует» карточки: всё, что прошло левее луча, рассыпается в ASCII-код.
 * Наведите курсор — лента плавно остановится. Без зависимостей, кроме React.
 * Стек: React + TypeScript + Tailwind.
 */

type Review = { text: string; name: string; from: string };

const REVIEWS: Review[] = [
  { text: "Благодарю за отличную подачу — всегда интересно смотреть. Главное — практическая польза на реальных кейсах.", name: "@nick_builds", from: "YouTube" },
  { text: "Планирую открыть своё агентство, и благодаря урокам набираюсь навыков. Очень дельный контент.", name: "Александр", from: "YouTube" },
  { text: "Видео чёткие и светлые, воспринимаются легко, всё запоминается. Ничего лишнего.", name: "Дмитрий К.", from: "Telegram" },
  { text: "Вызывает восхищение, сколько пользы даёшь. Успехов во всех начинаниях!", name: "@marina.design", from: "YouTube" },
  { text: "Огромная благодарность! Хорошая энергетика, видно, что вы любите то, чем занимаетесь.", name: "@valentina_k", from: "YouTube" },
  { text: "Невероятно! Как будто нашла клад. Огромный респект, буду пробовать.", name: "@dina.r", from: "YouTube" },
  { text: "Один из самых приятных авторов в нише: добрый, отзывчивый и при этом глубокий специалист.", name: "@pro_4053", from: "Telegram" },
  { text: "Редко комментирую, но тут не смог пройти мимо — ваш контент очень ценен.", name: "Игорь", from: "Telegram" },
];

const GLYPHS = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const noise = (cols: number, rows: number) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("")).join("\n");

const BEAM = 0.27; // положение луча — доля ширины
const SPEED = 38; // px/s

function Card({ r }: { r: Review }) {
  return (
    <article data-card className="relative h-[200px] w-[300px] flex-none overflow-hidden rounded-2xl border border-[#2a251d] bg-[#12100d]">
      <div data-face className="absolute inset-0 flex flex-col p-5" style={{ clipPath: "inset(0 0 0 var(--cut, 0px))" }}>
        <p className="line-clamp-4 text-[14px] leading-relaxed text-[#e9e2d6]">{r.text}</p>
        <div className="mt-auto flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3d38a,#b08a3e)] text-sm font-bold text-[#2a1f08]">{r.name.replace("@", "")[0].toUpperCase()}</span>
          <span className="leading-tight">
            <b className="block font-serif text-[15px] font-semibold text-[#f5ead7]">{r.name}</b>
            <small className="text-xs text-[#8f8574]">{r.from}</small>
          </span>
        </div>
      </div>
      <pre
        data-ascii
        aria-hidden
        className="absolute inset-0 m-0 overflow-hidden p-3 font-mono text-[10px] leading-[13px] text-[#c9a65a]/45"
        style={{ clipPath: "inset(0 calc(100% - var(--cut, 0px)) 0 0)" }}
      >
      </pre>
    </article>
  );
}

function Row({ items, dir, onRow }: { items: Review[]; dir: 1 | -1; onRow: (el: HTMLDivElement | null, dir: 1 | -1) => void }) {
  return (
    <div className="overflow-hidden">
      <div ref={(el) => onRow(el, dir)} className="flex w-max gap-6 will-change-transform">
        {[...items, ...items].map((r, i) => <Card key={i} r={r} />)}
      </div>
    </div>
  );
}

export default function ScannerTestimonials() {
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef<{ el: HTMLDivElement; dir: 1 | -1; x: number }[]>([]);
  const hover = useRef(false);

  const onRow = (el: HTMLDivElement | null, dir: 1 | -1) => {
    if (el && !rows.current.some((r) => r.el === el)) rows.current.push({ el, dir, x: dir === 1 ? -el.scrollWidth / 2 : 0 });
  };

  useEffect(() => {
    // Шум генерируется только на клиенте — иначе разъедется гидрация.
    root.current!.querySelectorAll("[data-ascii]").forEach((el) => (el.textContent = noise(52, 15)));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let speed = reduce ? 0 : SPEED, last = performance.now(), lastNoise = 0, raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += ((hover.current || reduce ? 0 : SPEED) - speed) * Math.min(1, dt * 4); // плавная остановка
      const box = root.current!.getBoundingClientRect();
      const beam = box.left + box.width * BEAM;
      const refresh = now - lastNoise > 90;
      if (refresh) lastNoise = now;

      for (const r of rows.current) {
        const half = r.el.scrollWidth / 2;
        r.x += r.dir * speed * dt;
        if (r.x > 0) r.x -= half;
        if (r.x < -half) r.x += half;
        r.el.style.transform = `translate3d(${r.x}px,0,0)`;
        r.el.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
          const c = card.getBoundingClientRect();
          const cut = Math.max(0, Math.min(c.width, beam - c.left));
          card.style.setProperty("--cut", `${cut}px`);
          if (refresh && cut > 0 && cut < c.width) card.querySelector("[data-ascii]")!.textContent = noise(52, 15);
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={root} className="relative w-full max-w-[1000px] overflow-hidden rounded-[28px] bg-[radial-gradient(90%_70%_at_20%_40%,#1a160f,#0a0908_70%)] py-10 font-sans text-white">
      <div className="px-8">
        <h3 className="font-serif text-[clamp(28px,4vw,44px)] leading-tight font-bold text-[#f5ead7]">Что говорят подписчики</h3>
        <p className="mt-2 max-w-[520px] text-[15px] text-[#9b9180]">Комментарии и сообщения из YouTube и Telegram. Подведите курсор — лента остановится.</p>
      </div>

      <div className="relative mt-8 flex flex-col gap-6" onMouseEnter={() => (hover.current = true)} onMouseLeave={() => (hover.current = false)}>
        <Row items={REVIEWS.slice(0, 4).concat(REVIEWS.slice(0, 2))} dir={-1} onRow={onRow} />
        <Row items={REVIEWS.slice(4).concat(REVIEWS.slice(2, 4))} dir={1} onRow={onRow} />

        {/* Луч */}
        <div className="pointer-events-none absolute inset-y-[-12px] z-10" style={{ left: `${BEAM * 100}%` }}>
          <div className="absolute inset-y-0 -left-16 w-16 bg-[radial-gradient(rgba(201,166,90,.35)_1px,transparent_1.5px)] [background-size:6px_6px] [mask-image:linear-gradient(90deg,transparent,#000)]" />
          <div className="absolute inset-y-0 -left-6 w-12 bg-[linear-gradient(90deg,transparent,rgba(245,214,140,.18),transparent)] blur-md" />
          <div className="absolute inset-y-0 -left-px w-[3px] bg-[linear-gradient(180deg,transparent,#f6dc9a_15%,#fff6dc_50%,#f6dc9a_85%,transparent)] shadow-[0_0_18px_4px_rgba(246,220,154,.55)]" />
        </div>
      </div>

      <div className="mt-9 flex flex-wrap justify-center gap-4 px-6">
        <a href="#" onClick={(e) => e.preventDefault()} className="rounded-xl border border-[#c9a65a]/60 bg-[#c9a65a]/10 px-6 py-3 text-sm font-semibold text-[#f0d28c] no-underline hover:bg-[#c9a65a]/20">Подписаться на YouTube →</a>
        <a href="#" onClick={(e) => e.preventDefault()} className="rounded-xl border border-white/10 bg-white/[.04] px-6 py-3 text-sm font-semibold text-white/85 no-underline hover:bg-white/[.08]">✈ Вступить в телеграм-сообщество</a>
      </div>
    </div>
  );
}
