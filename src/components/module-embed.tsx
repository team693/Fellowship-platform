"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseHealMessage, HEAL_COMPLETE, HEAL_PROGRESS } from "@/lib/module-messages";
import type { CompletionRule, ProgressStatus } from "@/lib/types";

interface ModuleEmbedProps {
  moduleId: string;
  title: string;
  completionRule: CompletionRule;
  /** Engagement dwell threshold (server is authoritative; this drives UI). */
  minSeconds: number;
  /** Reported pass threshold, for display only. */
  passScore: number | null;
  initialStatus: ProgressStatus | null;
  initialScore: number | null;
  nextHref: string | null;
  fellowshipHref: string;
}

type UiState = "loading" | "ready" | "submitting" | "completed" | "error";

export function ModuleEmbed({
  moduleId,
  title,
  completionRule,
  minSeconds,
  passScore,
  initialStatus,
  initialScore,
  nextHref,
  fellowshipHref,
}: ModuleEmbedProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [state, setState] = useState<UiState>(
    initialStatus === "completed" ? "completed" : "loading",
  );
  const [score, setScore] = useState<number | null>(initialScore);
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const alreadyDone = initialStatus === "completed";

  // Record a server-side "started_at" as soon as the module opens. This is
  // what the server checks engagement dwell time against — the client can't
  // fake having spent time on the module.
  useEffect(() => {
    if (alreadyDone) return;
    fetch("/api/progress/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    }).catch(() => {});
  }, [moduleId, alreadyDone]);

  // Local elapsed timer for the engagement "Mark complete" gate.
  useEffect(() => {
    if (alreadyDone || completionRule !== "engagement") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [alreadyDone, completionRule]);

  const submitCompletion = useCallback(
    async (reportedScore?: number, meta?: Record<string, unknown>) => {
      setState("submitting");
      setError(null);
      try {
        const res = await fetch("/api/progress/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, score: reportedScore, meta }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setState("error");
          setError(data.error ?? "Could not record completion.");
          return;
        }
        setScore(data.score ?? null);
        setState("completed");
        router.refresh();
      } catch {
        setState("error");
        setError("Network error. Please try again.");
      }
    },
    [moduleId, router],
  );

  // Listen for messages from the sandboxed iframe.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // SECURITY: tie the message to *our* iframe. Because the iframe is
      // sandboxed without allow-same-origin, event.origin is "null"; the
      // decisive check is that the message came from this iframe's window.
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const msg = parseHealMessage(event.data);
      if (!msg) return;
      // Ignore messages for a different module.
      if (msg.moduleId !== moduleId) return;

      if (msg.type === HEAL_PROGRESS) {
        setPercent(Math.max(0, Math.min(100, Math.round(msg.percent))));
        return;
      }
      if (msg.type === HEAL_COMPLETE) {
        // Only reported modules are allowed to self-report completion.
        // (Server also enforces this; we guard the UI too.)
        if (completionRule !== "reported") return;
        submitCompletion(msg.score, msg.meta);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [moduleId, completionRule, submitCompletion]);

  const remaining = Math.max(0, minSeconds - elapsed);
  const canMarkComplete = completionRule === "engagement" && remaining === 0;

  return (
    <div>
      {/* The iframe: sandboxed, opaque-origin, script-only. */}
      <div className="overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-card">
        <iframe
          ref={iframeRef}
          src={`/embed/${moduleId}`}
          title={title}
          onLoad={() => setState((s) => (s === "loading" ? "ready" : s))}
          className="h-[70vh] w-full bg-white"
          sandbox="allow-scripts allow-popups allow-forms allow-downloads allow-modals"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Optional live progress reported by the module. */}
      {percent > 0 && state !== "completed" && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-heal-gradient transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Completion controls */}
      <div className="mt-5 rounded-2xl border border-surface-muted bg-surface-subtle p-5">
        {state === "completed" ? (
          <CompletedPanel
            score={score}
            passScore={passScore}
            completionRule={completionRule}
            nextHref={nextHref}
            fellowshipHref={fellowshipHref}
          />
        ) : completionRule === "engagement" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">Ready to continue?</p>
              <p className="text-sm text-ink-soft">
                {canMarkComplete
                  ? "Mark this module complete when you're done exploring."
                  : `Spend a little time exploring — you can mark it complete in ${remaining}s.`}
              </p>
            </div>
            <button
              className="btn-primary"
              disabled={!canMarkComplete || state === "submitting"}
              onClick={() => submitCompletion()}
            >
              {state === "submitting" ? "Saving…" : "Mark complete & continue"}
            </button>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-ink">This is an assessed module</p>
            <p className="text-sm text-ink-soft">
              Complete the activity above.{" "}
              {passScore != null
                ? `You need at least ${passScore} to pass. `
                : ""}
              Your result is reported automatically and verified on our servers.
            </p>
            {state === "submitting" && (
              <p className="mt-2 text-sm text-teal-700">Recording your result…</p>
            )}
          </div>
        )}

        {state === "error" && error && (
          <p className="mt-3 rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function CompletedPanel({
  score,
  passScore,
  completionRule,
  nextHref,
  fellowshipHref,
}: {
  score: number | null;
  passScore: number | null;
  completionRule: CompletionRule;
  nextHref: string | null;
  fellowshipHref: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-mint-100 text-lg text-mint-700">
          ✓
        </span>
        <div>
          <p className="font-semibold text-ink">Module complete</p>
          {completionRule === "reported" && score != null && (
            <p className="text-sm text-ink-soft">
              Verified score: <strong>{score}</strong>
              {passScore != null ? ` / pass ${passScore}` : ""}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {nextHref ? (
          <Link href={nextHref} className="btn-primary">
            Next module →
          </Link>
        ) : (
          <Link href={fellowshipHref} className="btn-primary">
            Back to fellowship
          </Link>
        )}
      </div>
    </div>
  );
}
