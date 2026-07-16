/**
 * The postMessage contract between an embedded HTML module (inside the
 * sandboxed iframe) and the platform parent.
 *
 * From iframe -> parent:
 *   { type: "HEAL_MODULE_COMPLETE", moduleId: string, score?: number, meta?: object }
 *   { type: "HEAL_MODULE_PROGRESS", moduleId: string, percent: number }  // optional
 *
 * The parent VERIFIES that:
 *   - the message came from the current module's iframe (event.source check),
 *   - the shape matches,
 *   - the moduleId matches the module being displayed,
 * and then treats `score` as UNTRUSTED input — it is re-validated and clamped
 * server-side before it can ever count toward a certificate.
 */

export const HEAL_COMPLETE = "HEAL_MODULE_COMPLETE" as const;
export const HEAL_PROGRESS = "HEAL_MODULE_PROGRESS" as const;

export interface HealCompleteMessage {
  type: typeof HEAL_COMPLETE;
  moduleId: string;
  score?: number;
  meta?: Record<string, unknown>;
}

export interface HealProgressMessage {
  type: typeof HEAL_PROGRESS;
  moduleId: string;
  percent: number;
}

export type HealMessage = HealCompleteMessage | HealProgressMessage;

export function parseHealMessage(data: unknown): HealMessage | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.type === HEAL_COMPLETE && typeof d.moduleId === "string") {
    return {
      type: HEAL_COMPLETE,
      moduleId: d.moduleId,
      score: typeof d.score === "number" ? d.score : undefined,
      meta:
        d.meta && typeof d.meta === "object"
          ? (d.meta as Record<string, unknown>)
          : undefined,
    };
  }
  if (
    d.type === HEAL_PROGRESS &&
    typeof d.moduleId === "string" &&
    typeof d.percent === "number"
  ) {
    return { type: HEAL_PROGRESS, moduleId: d.moduleId, percent: d.percent };
  }
  return null;
}
