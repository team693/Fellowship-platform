"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The win-feedback kit. Three tiers, deliberately restrained:
 *  - CheckMark / ReviewMark: per-question verdicts that draw themselves in.
 *  - ScoreCount: a score that counts up instead of appearing.
 *  - ConfettiBurst: a single, brief burst for real milestones (passing an
 *    activity). Not for every correct answer — celebration inflation is how
 *    gamification starts to feel cheap.
 *
 * Everything here respects prefers-reduced-motion by rendering the final
 * state immediately, and none of it blocks interaction.
 */

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A mint check that draws its stroke in. Pass `delay` to cascade a list. */
export function CheckMark({ delay = 0 }: { delay?: number }) {
  const reduced = prefersReducedMotion();
  return (
    <span
      className="inline-grid h-5 w-5 place-items-center rounded-full bg-mint-500 align-middle"
      style={
        reduced
          ? undefined
          : {
              animation: `pop-in 320ms var(--ease-out-quart) ${delay}ms both`,
            }
      }
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
        <path
          d="M3.5 8.5l3 3 6-7"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            reduced
              ? undefined
              : {
                  strokeDasharray: 14,
                  strokeDashoffset: 14,
                  animation: `draw-check 360ms var(--ease-out-quart) ${delay + 160}ms forwards`,
                }
          }
        />
      </svg>
    </span>
  );
}

/** The coral counterpart — steady, not shaming. No shake, no wobble. */
export function ReviewMark({ delay = 0 }: { delay?: number }) {
  const reduced = prefersReducedMotion();
  return (
    <span
      className="inline-grid h-5 w-5 place-items-center rounded-full bg-coral-500 align-middle"
      style={
        reduced
          ? undefined
          : { animation: `pop-in 320ms var(--ease-out-quart) ${delay}ms both` }
      }
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
        <path
          d="M8 4v5M8 11.6v.6"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Counts from 0 to `value` over ~900ms with the site easing. */
export function ScoreCount({ value }: { value: number }) {
  const [shown, setShown] = useState(prefersReducedMotion() ? value : 0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const t0 = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const f = Math.min((t - t0) / dur, 1);
      // ease-out-quart, matching --ease-out-quart
      const e = 1 - Math.pow(1 - f, 4);
      setShown(Math.round(value * e));
      if (f < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{shown}</>;
}

/* Heal palette only — this is brand celebration, not a party store. */
const CONFETTI_COLORS = ["#0f8b80", "#45c887", "#3163fb", "#e6a92f", "#fb5f3d"];

/**
 * One brief confetti burst from the element's centre, fired on mount.
 * Renders nothing visible of its own; parent should be position:relative.
 * WAAPI + compositor-only properties, auto-removed when finished.
 */
export function ConfettiBurst({ count = 22 }: { count?: number }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = host.current;
    if (!el) return;
    const pieces: HTMLElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 5 + (i % 3) * 2;
      p.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${
        size * (i % 2 ? 1 : 0.5)
      }px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};border-radius:${
        i % 2 ? "50%" : "1px"
      };pointer-events:none;`;
      el.appendChild(p);
      pieces.push(p);
      const angle = (i / count) * Math.PI * 2 + (i % 5) * 0.13;
      const dist = 60 + (i % 7) * 16;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 40; // biased upward
      p.animate(
        [
          { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 70}px)) rotate(${
              200 + i * 40
            }deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 800 + (i % 5) * 120,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          fill: "forwards",
        },
      );
    }
    const timer = setTimeout(() => pieces.forEach((p) => p.remove()), 1600);
    return () => {
      clearTimeout(timer);
      pieces.forEach((p) => p.remove());
    };
  }, [count]);

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-visible"
    />
  );
}
