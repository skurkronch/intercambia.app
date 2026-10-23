"use client";

import { useMemo } from "react";

const COLORS = ["var(--lime)", "var(--violet)", "var(--cyan)", "var(--lime)", "var(--on-violet)"];

/** Lime-led confetti burst. Hidden entirely with prefers-reduced-motion (see CSS). */
export function Confetti({ pieces = 70, seed = 1 }: { pieces?: number; seed?: number }) {
  const bits = useMemo(() => {
    // Deterministic pseudo-random in [0, 1) so server and client agree.
    const rnd = (i: number, k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233 + seed * 3.17) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: pieces }, (_, i) => ({
      left: rnd(i, 1) * 100,
      delay: rnd(i, 2) * 0.6,
      dur: 1.6 + rnd(i, 3) * 1.6,
      size: 6 + rnd(i, 4) * 8,
      rot: rnd(i, 5) * 360,
      drift: (rnd(i, 6) - 0.5) * 160,
      round: rnd(i, 7) > 0.6,
      color: COLORS[i % COLORS.length],
    }));
  }, [pieces, seed]);

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.round ? b.size : b.size * 0.5,
            borderRadius: b.round ? "50%" : 2,
            background: b.color,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            ["--rot" as string]: `${b.rot}deg`,
            ["--drift" as string]: `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
