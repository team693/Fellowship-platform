"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

/**
 * The landing hero: five vertical slats, one per strand of the programme, with
 * the headline sitting on the dark middle panel.
 *
 * Layout follows the Parques de Sintra reference rather than a full-bleed band:
 * the slats are inset on white with real margins, and each one has its own
 * height and sits to the top or the bottom of the row, so the block has a
 * ragged silhouette against the page instead of a rectangular edge. The arrows
 * live in those margins and the dots sit underneath.
 *
 * The arrows and dots are not decoration — they move which panel is open. That
 * matters because hover does not exist on a phone, and without them the
 * expanded state would be desktop-only.
 *
 * On the photographs. All five are Unsplash, self-hosted under /public/hero
 * with their IDs in CREDITS.md. They lead with people doing something —
 * filling a jerrycan, holding a stethoscope, working a stall, building
 * something together — rather than with hardship. Photographs of identifiable
 * patients mid-treatment were available and were deliberately not used: a
 * stock licence is not a model release.
 */

type Panel = {
  key: string;
  src: string;
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  /** relative width in the row */
  grow: number;
  /** slat height as a % of the row, for the ragged edge */
  h: number;
  /** which edge of the row this slat hangs from */
  align: "start" | "end";
  pos: string;
};

const PANELS: Panel[] = [
  {
    key: "water",
    src: "/hero/water.jpg",
    eyebrow: "SDG 6",
    title: "Water & Environment",
    blurb: "Tanker economics, supply loss, and who ends up paying most.",
    href: "/login",
    grow: 1,
    h: 86,
    align: "start",
    pos: "50% 40%",
  },
  {
    key: "health",
    src: "/hero/health.jpg",
    eyebrow: "SDG 3",
    title: "Public Health",
    blurb: "Testing, surveillance, and getting care to where people already are.",
    href: "/login",
    grow: 0.92,
    h: 97,
    align: "end",
    pos: "50% 45%",
  },
  {
    key: "safety",
    src: "/hero/safety.jpg",
    eyebrow: "SDG 11",
    title: "Urban Safety",
    blurb: "Roads, lighting, and the geography of risk after dark.",
    href: "/login",
    grow: 2.6,
    h: 100,
    align: "start",
    pos: "50% 55%",
  },
  {
    key: "economy",
    src: "/hero/economy.jpg",
    eyebrow: "SDG 8",
    title: "Economic Opportunity",
    blurb: "Informal work, transit, and where the next jobs actually come from.",
    href: "/login",
    grow: 1,
    h: 90,
    align: "end",
    pos: "50% 50%",
  },
  {
    key: "capstone",
    src: "/hero/capstone.jpg",
    eyebrow: "WEEK 4",
    title: "Solutions Capstone",
    blurb: "Take one problem deeper, build a solution, publish it to your portfolio.",
    href: "/login",
    grow: 0.95,
    h: 82,
    align: "start",
    pos: "50% 38%",
  },
];

/** The dark panel the headline sits on, as in the reference. */
const TEXT_PANEL = 2;

export function HeroMontage() {
  const [active, setActive] = useState<number | null>(null);
  const step = (d: number) =>
    setActive((a) => {
      const next = (a === null ? TEXT_PANEL : a) + d;
      return (next + PANELS.length) % PANELS.length;
    });

  return (
    <section className="relative bg-surface pb-8 pt-4 lg:pb-12">
      <div className="relative mx-auto max-w-[1280px] px-10 sm:px-14 lg:px-16">
        {/* ---- the row of slats ---- */}
        <div className="relative flex h-[clamp(380px,62vh,600px)] items-stretch gap-1.5 sm:gap-2">
          {PANELS.map((p, i) => {
            const isActive = active === i;
            const dimmed = active !== null && !isActive;
            return (
              <Link
                key={p.key}
                href={p.href}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${p.title} — ${p.blurb}`}
                className={[
                  "group relative block overflow-hidden transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
                  /* Ragged heights are a wide-screen nicety. On a phone the slats
                     are ~70px each, and staggering them just opens white gaps the
                     headline then has to cross. Full height below sm. */
                  "h-full self-stretch sm:h-[var(--slat-h)]",
                  p.align === "start" ? "sm:self-start" : "sm:self-end",
                ].join(" ")}
                style={
                  {
                    "--slat-h": `${p.h}%`,
                    flexGrow: isActive
                      ? p.grow * (i === TEXT_PANEL ? 1.15 : 1.9)
                      : p.grow,
                    flexBasis: 0,
                  } as CSSProperties
                }
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  priority={i <= TEXT_PANEL}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 24vw"
                  style={{ objectFit: "cover", objectPosition: p.pos }}
                  className={[
                    "transition-[transform,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                    isActive ? "scale-[1.05]" : "scale-100",
                    dimmed ? "brightness-[.78] saturate-[.9]" : "brightness-100",
                  ].join(" ")}
                />

                {/* only as much shade as the label needs */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* The headline sits on this panel, so its shade belongs inside
                    it — clipped by this slat's own overflow. A blurred radial
                    floating in the overlay layer spilled a grey cloud across the
                    white page either side of the block. */}
                {i === TEXT_PANEL && (
                  <div className="pointer-events-none absolute inset-0 hidden bg-black/35 sm:block" />
                )}

                {/* Titles are hidden on phones: five slats across 390px leaves
                    about 70px each, which clipped "Economic Opportunity" to
                    "Economic Opportur". Small screens get the list below. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mint-100/95 sm:text-[10px]">
                    {p.eyebrow}
                  </p>
                  <p className="mt-1 hidden font-display text-sm font-extrabold leading-tight text-white sm:block lg:text-base">
                    {p.title}
                  </p>
                  <p
                    className={[
                      "hidden max-w-[24ch] overflow-hidden text-[13px] leading-snug text-white/85 transition-all duration-500 lg:block",
                      isActive ? "mt-2 max-h-24 opacity-100" : "mt-0 max-h-0 opacity-0",
                    ].join(" ")}
                  >
                    {p.blurb}
                  </p>
                </div>
              </Link>
            );
          })}

          {/* Phones: the headline is wider than any single slat, so the shade
              has to span the row rather than sit inside one panel. */}
          <div className="pointer-events-none absolute inset-0 z-[5] bg-black/55 sm:hidden" />

          {/* ---- the headline, over the dark middle panel ---- */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div
              className={[
                "w-full max-w-md px-4 text-center [text-shadow:0_2px_20px_rgba(0,0,0,.85)] transition-opacity duration-500",
                active !== null && active !== TEXT_PANEL
                  ? "opacity-0"
                  : "opacity-100",
              ].join(" ")}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint-100 sm:text-[11px]">
                Heal Social Foundation · Karachi
              </p>
              <h1 className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.9rem)] font-extrabold leading-[1.05] text-white">
                One city, four problems,
                <br />
                <span className="text-mint-100">and the people who solve them.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/85">
                Four weeks of impact simulations and case studies mapped to the
                UN SDGs — finishing with a verifiable Impact Certification.
              </p>
              <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-lift transition hover:bg-mint-100"
                >
                  Become a Solutions Builder
                </Link>
                <Link
                  href="#topics"
                  className="rounded-xl border border-white/50 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  See what you&rsquo;ll build
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---- arrows, out in the margins as the reference has them ---- */}
        {(
          [
            ["prev", -1, "left-0", "M14 5l-7 7 7 7"],
            ["next", 1, "right-0", "M10 5l7 7-7 7"],
          ] as const
        ).map(([name, dir, side, d]) => (
          <button
            key={name}
            type="button"
            onClick={() => step(dir)}
            aria-label={name === "prev" ? "Previous topic" : "Next topic"}
            className={`absolute ${side} top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-ink-soft transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:p-3`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={d} />
            </svg>
          </button>
        ))}

        {/* ---- progress ticks under the block ---- */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {PANELS.map((p, i) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${p.title}`}
              aria-current={active === i}
              className="group py-2"
            >
              <span
                className={[
                  "block h-[3px] w-10 rounded-full transition-colors sm:w-14",
                  active === i ? "bg-teal-600" : "bg-ink-muted/25 group-hover:bg-ink-muted/50",
                ].join(" ")}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ---- phones: the slats stay a colour band, the topics get a real list ---- */}
      <ul className="mt-2 divide-y divide-surface-muted border-y border-surface-muted sm:hidden">
        {PANELS.map((p) => (
          <li key={p.key}>
            <Link
              href={p.href}
              className="flex items-baseline gap-3 px-5 py-3 active:bg-surface-subtle"
            >
              <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-teal-700">
                {p.eyebrow}
              </span>
              <span className="font-display text-sm font-extrabold text-ink">
                {p.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
