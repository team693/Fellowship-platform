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
  const playerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<UiState>(
    initialStatus === "completed" ? "completed" : "loading",
  );
  const [score, setScore] = useState<number | null>(initialScore);
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const alreadyDone = initialStatus === "completed";

  // Record a server-side "started_at" as soon as the module opens.
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

  // Track fullscreen state.
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

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
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const msg = parseHealMessage(event.data);
      if (!msg) return;
      if (msg.moduleId !== moduleId) return;

      if (msg.type === HEAL_PROGRESS) {
        setPercent(Math.max(0, Math.min(100, Math.round(msg.percent))));
        return;
      }
      if (msg.type === HEAL_COMPLETE) {
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
    <div className="flex h-full flex-col">
      {/* Player: fills all remaining height; the game gets the whole area. */}
      <div ref={playerRef} className="relative min-h-0 flex-1 bg-white">
        <iframe
          ref={iframeRef}
          src={`/embed/${moduleId}`}
          title={title}
          onLoad={() => setState((s) => (s === "loading" ? "ready" : s))}
          className="absolute inset-0 h-full w-full bg-white"
          sandbox="allow-scripts allow-popups allow-forms allow-downloads allow-modals"
          referrerPolicy="no-referrer"
        />

        {/* Fullscreen toggle — bottom-left of the player. */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-ink"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <>
              <ExitFsIcon /> Exit fullscreen
            </>
          ) : (
            <>
              <EnterFsIcon /> Fullscreen
            </>
          )}
        </button>
      </div>

      {/* Optional live progress reported by the module. */}
      {percent > 0 && state !== "completed" && (
        <div className="h-1 w-full shrink-0 bg-surface-muted">
          <div
            className="h-full bg-heal-gradient transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Slim completion bar (no page scroll needed). */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-surface-muted bg-surface-subtle px-4 py-2.5">
        {state === "completed" ? (
          <>
            <span className="flex items-center gap-2 text-sm font-semibold text-mint-700">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-mint-100">
                ✓
              </span>
              Module complete
              {completionRule === "reported" && score != null && (
                <span className="font-normal text-ink-soft">
                  · score {score}
                  {passScore != null ? ` / pass ${passScore}` : ""}
                </span>
              )}
            </span>
            {nextHref ? (
              <Link href={nextHref} className="btn-primary py-1.5">
                Next module →
              </Link>
            ) : (
              <Link href={fellowshipHref} className="btn-primary py-1.5">
                Back to internship
              </Link>
            )}
          </>
        ) : completionRule === "engagement" ? (
          <>
            <span className="text-sm text-ink-soft">
              {canMarkComplete
                ? "Done exploring? Mark it complete to continue."
                : `Explore the module — you can mark it complete in ${remaining}s.`}
            </span>
            <button
              className="btn-primary py-1.5"
              disabled={!canMarkComplete || state === "submitting"}
              onClick={() => submitCompletion()}
            >
              {state === "submitting" ? "Saving…" : "Mark complete & continue"}
            </button>
          </>
        ) : (
          <span className="text-sm text-ink-soft">
            Assessed module — {passScore != null ? `score ${passScore}+ to pass. ` : ""}
            Your result is reported automatically and verified server-side.
            {state === "submitting" && (
              <span className="ml-2 text-teal-700">Recording…</span>
            )}
          </span>
        )}

        {state === "error" && error && (
          <span className="w-full text-sm text-coral-600">{error}</span>
        )}
      </div>
    </div>
  );
}

function EnterFsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExitFsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
