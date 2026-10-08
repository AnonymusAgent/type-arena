"use client";

import { type CSSProperties, useState } from "react";

export type BurstTone = "gold" | "boss" | "red" | "cyan";

/** Expanding ring + sparks at an absolute point (% coords) inside a position:relative arena. */
export function BurstFX({ x, y, tone = "cyan", label }: { x: number; y: number; tone?: BurstTone; label?: string }) {
  const [sparks] = useState(() =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 26 + Math.random() * 40;
      return { tx: Math.cos(a) * dist, ty: Math.sin(a) * dist, s: 4 + Math.random() * 6, d: Math.random() * 0.1, r: Math.random() * 360 };
    }),
  );
  return (
    <div className={`burst burst--${tone}`} style={{ left: `${x}%`, top: `${y}%` } as CSSProperties} aria-hidden="true">
      <span className="burst__ring" />
      {sparks.map((sp, i) => (
        <span
          key={i}
          className="burst__spark"
          style={{ "--tx": `${sp.tx}px`, "--ty": `${sp.ty}px`, "--s": `${sp.s}px`, "--d": `${sp.d}s`, "--r": `${sp.r}deg` } as CSSProperties}
        />
      ))}
      {label && <span className="burst__label">{label}</span>}
    </div>
  );
}

const CONFETTI_COLORS = ["#c5fb56", "#63e5e4", "#977aff", "#f43f5e", "#facc15", "#fb923c"];

/** One-shot confetti rain that fills its parent (used on win screens). */
export function ConfettiRain({ count = 70, accent }: { count?: number; accent?: string }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      d: Math.random() * 1.1,
      dur: 1.8 + Math.random() * 1.6,
      rot: 360 + Math.random() * 480,
      drift: Math.random() * 120 - 60,
      w: 6 + Math.random() * 5,
      h: 8 + Math.random() * 7,
      color: accent && i % 3 === 0 ? accent : CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti__piece"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              "--d": `${p.d}s`,
              "--dur": `${p.dur}s`,
              "--rot": `${p.rot}deg`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Dark red vignette + shake for defeat screens. */
export function DefeatVignette() {
  return <div className="defeat-vignette" aria-hidden="true" />;
}

export function ResultFX({ won, accent }: { won: boolean; accent?: string }) {
  return won ? <ConfettiRain accent={accent} /> : <DefeatVignette />;
}