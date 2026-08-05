"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/**
 * Full-bleed hero: five vertical slats, one per thing the programme works on,
 * with the headline floating over them.
 *
 * On the images:
 *  - All five are Unsplash, self-hosted in /public/hero (see hero/CREDITS.md).
 *    The Unsplash licence allows commercial use without attribution; we credit
 *    anyway because it costs nothing.
 *  - They are deliberately material and place-led rather than hardship-led:
 *    rooftop tanks, water under glass, a road at night, a bazaar, the Mazar.
 *    Photographs of identifiable patients were available and were not used —
 *    a stock licence is not a model release, and a clinic queue is not
 *    marketing material.
 *  - next/image handles format and size negotiation, so a phone gets a small
 *    AVIF off the same source a desktop gets a large one from.
 */

type Panel = {
  key: string;
  src: string;
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  /** vertical offset in % — the ragged top/bottom edge the reference has */
  offset: number;
  /** object-position, so the subject survives an aggressive crop */
  pos: string;
};

const PANELS: Panel[] = [
  {
    key: "water",
    src: "/hero/water.jpg",
    eyebrow: "SDG 6",
    title: "Water & Environment",
    blurb: "Tanker economics, supply loss, and who pays most for water.",
    href: "/login",
    offset: 4,
    pos: "50% 40%",
  },
  {
    key: "health",
    src: "/hero/health.jpg",
    eyebrow: "SDG 3",
    title: "Public Health",
    blurb: "Testing, surveillance, and getting care to where people are.",
    href: "/login",
    offset: -6,
    pos: "50% 50%",
  },
  {
    key: "safety",
    src: "/hero/safety.jpg",
    eyebrow: "SDG 11",
    title: "Urban Safety",
    blurb: "Roads, lighting, and the geography of risk after dark.",
    href: "/login",
    offset: 8,
    pos: "50% 55%",
  },
  {
    key: "economy",
    src: "/hero/economy.jpg",
    eyebrow: "SDG 8",
    title: "Economic Opportunity",
    blurb: "Informal work, transit, and where the next jobs come from.",
    href: "/login",
    offset: -3,
    pos: "50% 45%",
  },
  {
    key: "city",
    src: "/hero/city.jpg",
    eyebrow: "WEEK 1",
    title: "Karachi as a living lab",
    blurb: "AI literacy and professional ethics, grounded in one city.",
    href: "/login",
    offset: 6,
    pos: "50% 40%",
  },
];

export function HeroMontage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="relative isolate w-full overflow-hidden bg-ink">
      {/* Wrapper exists so the headline overlay is anchored to the slats alone.
          Anchored to the section it would also span the phone topic list below
          and the headline would drift off-centre on small screens. */}
      <div className="relative">
      {/* ---- the slats ---- */}
      <div className="flex h-[min(86vh,820px)] min-h-[440px] w-full gap-[3px]">
        {PANELS.map((p, i) => {
          const isActive = active === p.key;
          const dimmed = active !== null && !isActive;
          return (
            <Link
              key={p.key}
              href={p.href}
              onMouseEnter={() => setActive(p.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.key)}
              onBlur={() => setActive(null)}
              aria-label={`${p.title} — ${p.blurb}`}
              className={[
                "group relative block h-full overflow-hidden",
                "transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-100",
              ].join(" ")}
              style={{ flexGrow: isActive ? 1.9 : 1, flexBasis: 0 }}
            >
              {/* the ragged edge: each slat sits a little high or low */}
              <div
                className="absolute inset-x-0 h-[118%]"
                style={{ top: `${p.offset - 9}%` }}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  priority={i < 3}
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 22vw"
                  style={{ objectFit: "cover", objectPosition: p.pos }}
                  className={[
                    "transition-[transform,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                    isActive ? "scale-[1.04]" : "scale-100",
                    dimmed ? "brightness-[.72] saturate-[.85]" : "brightness-100",
                  ].join(" ")}
                />
              </div>

              {/* Legibility only where it is needed — the foot of the slat, where
                  the label sits, and a whisper at the top for the header. The
                  middle is left alone so the photograph keeps its colour. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

              {/* Label — lifts and gains its blurb on hover. Titles are hidden
                  on phones: five slats across 390px leaves ~78px each, which
                  clipped "Economic Opportunity" to "Economic Opportur". Small
                  screens get the readable list under the hero instead. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mint-100/90 sm:text-[10px]">
                  {p.eyebrow}
                </p>
                <p className="mt-1 hidden font-display text-[13px] font-extrabold leading-tight text-white sm:block sm:text-base lg:text-lg">
                  {p.title}
                </p>
                <p
                  className={[
                    "hidden max-w-[22ch] overflow-hidden text-sm text-white/85 transition-all duration-500 lg:block",
                    isActive ? "mt-2 max-h-24 opacity-100" : "mt-0 max-h-0 opacity-0",
                  ].join(" ")}
                >
                  {p.blurb}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ---- the headline, floating over the middle ---- */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
        <div
          className={[
            /* stays pointer-transparent: only the buttons below opt back in, so
               hovering "through" the headline still reaches the slat behind it */
            "w-full max-w-2xl text-center transition-opacity duration-500",
            // Step out of the way while someone is reading a slat.
            active ? "opacity-0 lg:opacity-15" : "opacity-100",
          ].join(" ")}
        >
          {/* soft pool of shade so the type holds against any panel under it */}
          {/* Neutral black, not `ink`. ink is #0b1f1d — a dark green — and a scrim
              that size tinted the whole hero teal, draining the orange tanks and
              the gold of the bazaar. */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[112%] w-[116%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/50 blur-2xl" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint-100/90 sm:text-xs">
            Heal Social Foundation · Karachi
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.85rem,5.2vw,4rem)] font-extrabold leading-[1.04] text-white">
            One city, four problems,
            <br />
            <span className="bg-gradient-to-r from-mint-100 via-white to-mint-100 bg-clip-text text-transparent">
              and the people who solve them.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/80 sm:text-base">
            Four weeks of impact simulations and case studies mapped to the UN
            Sustainable Development Goals — finishing with an Impact
            Certification anyone can independently verify.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-lift transition hover:bg-mint-100 sm:text-base"
            >
              Become a Solutions Builder
            </Link>
            <Link
              href="#topics"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:text-base"
            >
              See what you&rsquo;ll build
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* ---- phones: the slats stay as a colour band, the topics get a list ---- */}
      <ul className="divide-y divide-white/10 border-t border-white/10 bg-ink sm:hidden">
        {PANELS.map((p) => (
          <li key={p.key}>
            <Link
              href={p.href}
              className="flex items-baseline gap-3 px-5 py-3 active:bg-white/5"
            >
              <span className="w-12 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-mint-100/80">
                {p.eyebrow}
              </span>
              <span className="font-display text-sm font-extrabold text-white">
                {p.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

    </section>
  );
}
