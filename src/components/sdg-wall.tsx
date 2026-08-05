import { SDGS } from "@/lib/sdgs";

/**
 * Decorative isometric wall of SDG tiles for the empty gutters either side of
 * the programme page, echoing the UN's 2030 Agenda primer cover.
 *
 * Notes on what this is and is not:
 *  - The colours are the official SDG palette (see src/lib/sdgs.ts). The icons
 *    are simplified line-art of our own, not the UN's icon artwork.
 *  - The UN emblem is deliberately absent. The SDG colours and the idea of the
 *    goals are free to use for informational purposes; the emblem is not.
 *  - Purely decorative: aria-hidden, no pointer events, and only rendered once
 *    the viewport is wide enough to have gutters to put it in. It carries no
 *    information — the goals this programme actually covers are listed in the
 *    SDG card in the page body, and there are six of them, not seventeen.
 *
 * Everything here is deterministic. A random layout would differ between the
 * server render and the client hydration and React would throw it away.
 */

/* 2:1 isometric tile: the top face is a diamond 2W across and 2H tall, and the
   cube drops D below it. */
const W = 42;
const H = 21;
const D = 40;
/* tailwind surface-subtle: the page behind this panel */
const PAGE_BG = "#f6faf9";
const COLS = 4;
const ROWS = 18;

/** Multiply a hex colour toward black, for the two shaded side faces. */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}

/* A fixed, hand-picked order so neighbouring tiles never share a colour and the
   palette reads as varied rather than as a rainbow ramp. */
const ORDER = [11, 7, 13, 4, 6, 15, 1, 9, 16, 2, 10, 3, 17, 5, 14, 8, 12];

/**
 * The seventeen glyphs, each drawn inside a 24x24 box centred on the origin of
 * its tile. Stroke-based so they stay crisp at any scale.
 */
function Glyph({ n }: { n: number }) {
  const s = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (n) {
    case 1: // No poverty — a family group
      return (
        <g {...s}>
          <circle cx="8" cy="8" r="2.4" />
          <path d="M4.4 18v-3.2a3.6 3.6 0 0 1 7.2 0V18" />
          <circle cx="16" cy="9.5" r="2" />
          <path d="M13 18v-2.6a3 3 0 0 1 6 0V18" />
        </g>
      );
    case 2: // Zero hunger — a steaming bowl
      return (
        <g {...s}>
          <path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z" />
          <path d="M8 7.5c0-1.2 1-1.6 1-2.8M12 7c0-1.4 1-1.8 1-3M16 7.5c0-1.2 1-1.6 1-2.8" />
        </g>
      );
    case 3: // Good health — a pulse trace
      return (
        <g {...s}>
          <path d="M2.5 12h4l2.2-5 3.4 10 2.4-6 1.8 3h5.2" />
        </g>
      );
    case 4: // Quality education — a graduation cap
      return (
        <g {...s}>
          <path d="M2.5 9.5 12 5.5l9.5 4L12 13.5Z" />
          <path d="M6.5 11.4V16c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.6" />
        </g>
      );
    case 5: // Gender equality — combined symbols
      return (
        <g {...s}>
          <circle cx="11" cy="11" r="4.2" />
          <path d="M11 15.2V20M8.6 17.6h4.8M14 8l5-5M15.4 3H19v3.6" />
        </g>
      );
    case 6: // Clean water — a droplet
      return (
        <g {...s}>
          <path d="M12 3.5c3.4 4 5.4 6.6 5.4 9.2a5.4 5.4 0 0 1-10.8 0c0-2.6 2-5.2 5.4-9.2Z" />
          <path d="M3 19.5c1.8-1.3 3.4-1.3 5.2 0M15.8 19.5c1.8-1.3 3.4-1.3 5.2 0" />
        </g>
      );
    case 7: // Clean energy — the sun
      return (
        <g {...s}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9" />
        </g>
      );
    case 8: // Decent work — rising bars
      return (
        <g {...s}>
          <path d="M3.5 20h17" />
          <path d="M6.5 20v-4.5M11 20V11M15.5 20V7" />
          <path d="M17.5 4.5H20V7" />
        </g>
      );
    case 9: // Industry — stacked blocks
      return (
        <g {...s}>
          <rect x="3.5" y="12.5" width="7" height="7" rx="0.8" />
          <rect x="13.5" y="12.5" width="7" height="7" rx="0.8" />
          <rect x="8.5" y="4.5" width="7" height="7" rx="0.8" />
        </g>
      );
    case 10: // Reduced inequalities — converging arrows
      return (
        <g {...s}>
          <path d="M4 9.5h16M4 14.5h16" />
          <path d="M9 4.5 12 1.8l3 2.7M9 19.5l3 2.7 3-2.7" />
        </g>
      );
    case 11: // Sustainable cities — a skyline
      return (
        <g {...s}>
          <path d="M2.5 20h19" />
          <path d="M4.5 20V9.5l5-3v13.5M9.5 20V12h5.5v8M15 20v-5.5h4.5V20" />
        </g>
      );
    case 12: // Responsible consumption — a closed loop
      return (
        <g {...s}>
          <path d="M8 8.5a3.5 3.5 0 1 0 0 7c2.6 0 4-3.5 6.6-3.5a3.5 3.5 0 1 1 0 7c-2.6 0-4-3.5-6.6-3.5" />
        </g>
      );
    case 13: // Climate action — a spiral inside an eye
      return (
        <g {...s}>
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <path d="M13.6 10.6a2.2 2.2 0 1 0 .6 2.4" />
        </g>
      );
    case 14: // Life below water — a fish over waves
      return (
        <g {...s}>
          <path d="M3.5 10.5c3.5-4 9.5-4 13 0-3.5 4-9.5 4-13 0Z" />
          <path d="M16.5 10.5 20.5 7v7Z" />
          <path d="M3 17.5c2-1.4 3.8-1.4 5.8 0 2-1.4 3.8-1.4 5.8 0 1.4-1 2.7-1.3 4.1-.8" />
        </g>
      );
    case 15: // Life on land — a tree
      return (
        <g {...s}>
          <path d="M12 20v-6" />
          <path d="M12 14c-3.6 0-6-2.2-6-5s2.4-5.5 6-5.5S18 6.2 18 9s-2.4 5-6 5Z" />
          <path d="M3.5 20h17" />
        </g>
      );
    case 16: // Peace and justice — a dove
      return (
        <g {...s}>
          <path d="M3.5 13.5c3-6 7.5-8 12-8 0 3-1 5-2.5 6.5 2 .5 3.5 0 5-1-1 4.5-4.5 8-9.5 8-2.2 0-4-.7-5-1.6 1.6-.4 2.8-1.2 3.5-2.2-1.8-.2-3-.8-3.5-1.7Z" />
        </g>
      );
    default: // 17 Partnerships — interlocking rings
      return (
        <g {...s}>
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </g>
      );
  }
}

/** One isometric cube: top diamond plus its two shaded side faces. */
function Cube({ x, y, n }: { x: number; y: number; n: number }) {
  const base = SDGS[n]?.color ?? "#5c6b69";
  return (
    <g>
      {/* left face */}
      <path
        d={`M${x - W},${y} L${x},${y + H} L${x},${y + H + D} L${x - W},${y + D} Z`}
        fill={shade(base, 0.74)}
      />
      {/* right face */}
      <path
        d={`M${x + W},${y} L${x},${y + H} L${x},${y + H + D} L${x + W},${y + D} Z`}
        fill={shade(base, 0.88)}
      />
      {/* top face */}
      <path
        d={`M${x},${y - H} L${x + W},${y} L${x},${y + H} L${x - W},${y} Z`}
        fill={base}
      />
      {/* the glyph sits upright on the top face, as it does on the primer cover */}
      <g transform={`translate(${x - 10.5},${y - 10.5}) scale(0.875)`}>
        <Glyph n={n} />
      </g>
    </g>
  );
}

function Wall({ side }: { side: "left" | "right" }) {
  const cubes: { x: number; y: number; n: number }[] = [];
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cubes.push({
        x: col * 2 * W + (row % 2) * W,
        y: row * H,
        n: ORDER[i++ % ORDER.length],
      });
    }
  }
  const vbW = COLS * 2 * W + W;
  const vbH = ROWS * H + D + H;
  const fadeId = `sdgfade-${side}`;

  return (
    <svg
      viewBox={`${-W} ${-H} ${vbW} ${vbH}`}
      preserveAspectRatio={side === "left" ? "xMinYMid slice" : "xMaxYMid slice"}
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Fade toward the reading column so the tiles never fight the text —
            the primer cover dissolves the same way. The fade colour is the page
            background, not white: fading to white left a faint vertical seam
            where the panel met surface-subtle. */}
        <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
          <stop
            offset="0"
            stopColor={PAGE_BG}
            stopOpacity={side === "left" ? 0.1 : 1}
          />
          <stop
            offset="0.45"
            stopColor={PAGE_BG}
            stopOpacity={side === "left" ? 0.42 : 0.72}
          />
          <stop
            offset="0.55"
            stopColor={PAGE_BG}
            stopOpacity={side === "left" ? 0.72 : 0.42}
          />
          <stop
            offset="1"
            stopColor={PAGE_BG}
            stopOpacity={side === "left" ? 1 : 0.1}
          />
        </linearGradient>
      </defs>
      {/* Painter's order: later rows overlap the side faces of the ones above,
          which is what makes the grid read as stacked cubes. */}
      {cubes.map((c, k) => (
        <Cube key={k} x={c.x} y={c.y} n={c.n} />
      ))}
      <rect
        x={-W}
        y={-H}
        width={vbW}
        height={vbH}
        fill={`url(#${fadeId})`}
      />
    </svg>
  );
}

/**
 * Fixed to the window rather than the page so the wall stays put while the
 * content scrolls. Hidden below xl, where the gutters close up and there is
 * nowhere to put it without crowding the text.
 */
export function SdgWall() {
  return (
    <div aria-hidden className="pointer-events-none select-none">
      <div className="fixed inset-y-0 left-0 z-0 hidden w-[calc((100vw-48rem)/2)] max-w-[26rem] xl:block">
        <Wall side="left" />
      </div>
      <div className="fixed inset-y-0 right-0 z-0 hidden w-[calc((100vw-48rem)/2)] max-w-[26rem] xl:block">
        <Wall side="right" />
      </div>
    </div>
  );
}
