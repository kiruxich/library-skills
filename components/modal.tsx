"use client";

import { useEffect } from "react";

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(40,25,15,.4)] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`max-h-[90vh] w-full overflow-auto rounded-[26px] border border-line bg-surface p-7 shadow-[0_30px_80px_rgba(40,20,10,.3)] ${wide ? "max-w-[760px]" : "max-w-[640px]"}`}>
        <button onClick={onClose} className="float-right cursor-pointer rounded-[10px] bg-bg2 px-3 py-1.5 text-[13px] font-bold text-ink">
          Закрыть
        </button>
        {children}
      </div>
    </div>
  );
}

export function CopyButton({ text, label = "Копировать", className = "" }: { text: string; label?: string; className?: string }) {
  return (
    <button
      className={`cursor-pointer rounded-[10px] bg-accent px-3 py-1.5 text-[13px] font-bold whitespace-nowrap text-[#fff8f0] ${className}`}
      onClick={(e) => {
        navigator.clipboard?.writeText(text);
        const b = e.currentTarget;
        b.textContent = "Скопировано ✓";
        setTimeout(() => (b.textContent = label), 1600);
      }}
    >
      {label}
    </button>
  );
}

export const plural = (n: number, a: string, b: string, c: string) => {
  const m = n % 10, h = n % 100;
  return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c;
};
