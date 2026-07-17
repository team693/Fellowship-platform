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
 * SDG coverage panel: shows every SDG in the internship, highlighting the ones
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
