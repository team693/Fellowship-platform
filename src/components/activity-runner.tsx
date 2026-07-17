"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicActivity, PublicQuestion } from "@/lib/activity";

type Answers = Record<string, unknown>;

interface SubmitResult {
  score: number;
  passed: boolean;
  passScore: number;
  essayOk: boolean;
  perQuestion: Record<string, boolean>;
}

export function ActivityRunner({
  moduleId,
  nextHref,
  fellowshipHref,
  alreadyCompleted,
}: {
  moduleId: string;
  nextHref: string | null;
  fellowshipHref: string;
  alreadyCompleted: boolean;
}) {
  const router = useRouter();
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [priorScore, setPriorScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/activities/${moduleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (!data.ok) {
          setError(data.error ?? "Could not load this activity.");
        } else {
          setActivity(data.activity);
          if (data.submission?.answers) setAnswers(data.submission.answers);
          if (typeof data.submission?.score === "number")
            setPriorScore(data.submission.score);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Could not load this activity.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [moduleId]);

  const setAnswer = useCallback((id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/activities/${moduleId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not submit.");
      } else {
        setResult(data);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />;
  }
  if (error && !activity) {
    return (
      <div className="rounded-2xl bg-coral-50 p-6 text-coral-700">{error}</div>
    );
  }
  if (!activity) return null;

  return (
    <div>
      {activity.intro && (
        <div className="mb-5 rounded-2xl border border-surface-muted bg-white p-5 text-ink-soft shadow-card">
          {activity.intro}
        </div>
      )}

      {(alreadyCompleted || priorScore != null) && !result && (
        <p className="mb-4 rounded-lg bg-mint-50 px-3 py-2 text-sm text-mint-800">
          {alreadyCompleted
            ? "You've already passed this activity."
            : `Your last score was ${priorScore}.`}{" "}
          You can revise your answers and submit again.
        </p>
      )}

      <ol className="space-y-5">
        {activity.questions.map((q, i) => (
          <li
            key={q.id}
            className="rounded-2xl border border-surface-muted bg-white p-5 shadow-card"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-bold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{q.prompt}</p>
                <div className="mt-3">
                  <QuestionInput
                    q={q}
                    value={answers[q.id]}
                    onChange={(v) => setAnswer(q.id, v)}
                    verdict={result?.perQuestion?.[q.id]}
                    locked={!!result}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Result / actions */}
      <div className="mt-6 rounded-2xl border border-surface-muted bg-surface-subtle p-5">
        {result ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-lg font-bold ${result.passed ? "text-mint-700" : "text-coral-600"}`}
              >
                {result.passed ? "Passed 🎉" : "Not passed yet"} — {result.score}/100
              </p>
              <p className="text-sm text-ink-soft">
                {result.passed
                  ? "This activity is complete."
                  : `You need ${result.passScore} to pass${result.essayOk ? "" : " (and a complete written answer)"}. Revise and try again.`}
              </p>
            </div>
            <div className="flex gap-2">
              {result.passed && nextHref ? (
                <Link href={nextHref} className="btn-primary">
                  Next module →
                </Link>
              ) : result.passed ? (
                <Link href={fellowshipHref} className="btn-primary">
                  Back to internship
                </Link>
              ) : (
                <button className="btn-ghost" onClick={() => setResult(null)}>
                  Revise answers
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              Answer every question, then submit for grading.
            </p>
            <button className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for grading"}
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      </div>
    </div>
  );
}

function QuestionInput({
  q,
  value,
  onChange,
  verdict,
  locked,
}: {
  q: PublicQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  verdict?: boolean;
  locked: boolean;
}) {
  const verdictMark =
    verdict === undefined ? null : verdict ? (
      <span className="ml-2 text-sm font-semibold text-mint-700">✓ correct</span>
    ) : (
      <span className="ml-2 text-sm font-semibold text-coral-600">✗ review</span>
    );

  switch (q.type) {
    case "mcq":
      return (
        <div>
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-surface-muted px-3 py-2 hover:bg-surface-subtle"
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={value === idx}
                  disabled={locked}
                  onChange={() => onChange(idx)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {verdictMark}
        </div>
      );

    case "multi": {
      const arr = Array.isArray(value) ? (value as number[]) : [];
      return (
        <div>
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-surface-muted px-3 py-2 hover:bg-surface-subtle"
              >
                <input
                  type="checkbox"
                  checked={arr.includes(idx)}
                  disabled={locked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...arr, idx]
                      : arr.filter((n) => n !== idx);
                    onChange(next);
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {verdictMark}
        </div>
      );
    }

    case "numeric":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input max-w-[180px]"
            value={typeof value === "number" ? value : ""}
            disabled={locked}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
          {q.unit && <span className="text-ink-muted">{q.unit}</span>}
          {verdictMark}
        </div>
      );

    case "essay": {
      const text = typeof value === "string" ? value : "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return (
        <div>
          <textarea
            className="input min-h-[120px]"
            value={text}
            disabled={locked}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your answer…"
          />
          <p className="mt-1 text-xs text-ink-muted">
            {words} words{q.minWords ? ` · ${q.minWords} required` : ""} · reviewed by Heal
          </p>
        </div>
      );
    }

    case "matching": {
      const map = (value ?? {}) as Record<string, number>;
      return (
        <div>
          <div className="space-y-2">
            {q.left.map((leftItem, li) => (
              <div key={li} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 rounded-xl bg-surface-subtle px-3 py-2 text-sm">
                  {leftItem}
                </span>
                <span className="text-ink-muted">→</span>
                <select
                  className="input max-w-[200px]"
                  value={map[String(li)] ?? ""}
                  disabled={locked}
                  onChange={(e) =>
                    onChange({ ...map, [li]: Number(e.target.value) })
                  }
                >
                  <option value="">Choose…</option>
                  {q.right.map((r, ri) => (
                    <option key={ri} value={ri}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {verdictMark}
        </div>
      );
    }

    case "order": {
      const current: number[] = Array.isArray(value)
        ? (value as number[])
        : q.items.map((_, i) => i);
      const move = (pos: number, dir: -1 | 1) => {
        const next = [...current];
        const target = pos + dir;
        if (target < 0 || target >= next.length) return;
        [next[pos], next[target]] = [next[target], next[pos]];
        onChange(next);
      };
      return (
        <div>
          <ol className="space-y-2">
            {current.map((itemIdx, pos) => (
              <li
                key={itemIdx}
                className="flex items-center gap-2 rounded-xl border border-surface-muted px-3 py-2"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-muted text-xs font-bold">
                  {pos + 1}
                </span>
                <span className="flex-1">{q.items[itemIdx]}</span>
                <button
                  type="button"
                  className="rounded px-2 text-ink-soft hover:bg-surface-subtle disabled:opacity-30"
                  disabled={locked || pos === 0}
                  onClick={() => move(pos, -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded px-2 text-ink-soft hover:bg-surface-subtle disabled:opacity-30"
                  disabled={locked || pos === current.length - 1}
                  onClick={() => move(pos, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
              </li>
            ))}
          </ol>
          {verdictMark}
        </div>
      );
    }
  }
}
