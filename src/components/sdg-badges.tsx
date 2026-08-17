import { getSdg } from "@/lib/sdgs";

/** Small coloured SDG number chips. */
export function SdgChips({
  sdgs,
  size = "sm",
}: {
  sdgs: number[];
  size?: "sm" | "xs";
}) {
  if (!sdgs || sdgs.length === 0) return null;
  const dim = size === "xs" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs";
  return (
    <span className="inline-flex flex-wrap gap-1">
      {sdgs.map((n) => {
        const sdg = getSdg(n);
        return (
          <span
            key={n}
            title={`SDG ${n}: ${sdg.title}`}
            className={`grid ${dim} place-items-center rounded font-bold text-white`}
            style={{ backgroundColor: sdg.color }}
          >
            {n}
          </span>
        );
      })}
    </span>
  );
}

/**
 * SDG coverage panel: shows every SDG in the program, highlighting the ones
 * the student has already covered (via completed modules).
 */
export function SdgCoverage({
  allSdgs,
  coveredSdgs,
}: {
  allSdgs: number[];
  coveredSdgs: number[];
}) {
  if (allSdgs.length === 0) return null;
  const covered = new Set(coveredSdgs);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-soft">
          UN SDGs you&apos;re covering
        </h3>
        <span className="text-sm font-semibold text-teal-700">
          {covered.size}/{allSdgs.length}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {allSdgs.map((n) => {
          const sdg = getSdg(n);
          const done = covered.has(n);
          return (
            <span
              key={n}
              title={`SDG ${n}: ${sdg.title}${done ? " — covered" : ""}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity ${
                done ? "border-transparent text-white" : "border-surface-muted text-ink-muted opacity-60"
              }`}
              style={done ? { backgroundColor: sdg.color } : undefined}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.25)" : sdg.color,
                  color: done ? "#fff" : "#fff",
                }}
              >
                {n}
              </span>
              {sdg.title}
              {done && " ✓"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Mix an SDG hex colour toward white, so the official palette reads muted. */
function soften(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

/**
 * One quiet line of SDG coverage: small flat tiles in softened official
 * colours, covered goals filled and the rest ghosted, with a count at the end.
 * Replaces both the decorative cube wall and the full coverage card — the same
 * information at a fraction of the visual volume.
 */
export function SdgStrip({
  allSdgs,
  coveredSdgs,
}: {
  allSdgs: number[];
  coveredSdgs: number[];
}) {
  if (!allSdgs || allSdgs.length === 0) return null;
  const covered = new Set(coveredSdgs);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        UN SDGs
      </span>
      <span className="inline-flex gap-1">
        {allSdgs.map((n) => {
          const sdg = getSdg(n);
          const done = covered.has(n);
          return (
            <span
              key={n}
              title={`SDG ${n}: ${sdg.title}${done ? " — covered" : ""}`}
              className="grid h-5 w-5 place-items-center rounded-[5px] text-[10px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={
                done
                  ? { backgroundColor: soften(sdg.color, 0.12), color: "#fff" }
                  : {
                      backgroundColor: soften(sdg.color, 0.82),
                      color: soften(sdg.color, 0.05),
                    }
              }
            >
              {n}
            </span>
          );
        })}
      </span>
      <span className="text-xs text-ink-muted">
        {covered.size} of {allSdgs.length} covered
      </span>
    </div>
  );
}
