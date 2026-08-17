"use client";

import { useEffect, useState } from "react";

/**
 * A small SVG progress ring that sweeps to its value on mount. Used where a
 * single number is the story (the dashboard's next-up card); bars remain the
 * right tool inside dense cards. Sweep is CSS-transitioned stroke-dashoffset,
 * so it costs nothing after the first paint; reduced motion renders the final
 * state immediately.
 */
export function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(Math.max(percent, 0), 100) / 100);
  const [offset, setOffset] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? target
      : c,
  );

  useEffect(() => {
    // One frame at the empty state, then transition to the real value.
    const raf = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${percent}% complete`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-surface-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="stroke-teal-600"
        style={{ transition: "stroke-dashoffset 900ms var(--ease-out-quart)" }}
      />
    </svg>
  );
}
