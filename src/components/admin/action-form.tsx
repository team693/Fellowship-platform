"use client";

import { useState, useTransition } from "react";

type ActionResult = { ok: boolean; error?: string } | void;

/**
 * Thin client wrapper around a server action so forms can surface success /
 * error feedback. Server actions that call redirect() just navigate; ones that
 * return { ok, error } show inline messages.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  successMessage,
  className,
  variant = "primary",
  confirm,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children?: React.ReactNode;
  submitLabel: string;
  successMessage?: string;
  className?: string;
  variant?: "primary" | "ghost" | "danger";
  confirm?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const btnClass =
    variant === "danger" ? "btn-danger" : variant === "ghost" ? "btn-ghost" : "btn-primary";

  return (
    <form
      className={className}
      action={(formData) => {
        if (confirm && !window.confirm(confirm)) return;
        setError(null);
        setOk(false);
        startTransition(async () => {
          const res = await action(formData);
          if (res && !res.ok) setError(res.error ?? "Something went wrong.");
          else setOk(true);
        });
      }}
    >
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" className={btnClass} disabled={isPending}>
          {isPending ? "Working…" : submitLabel}
        </button>
        {ok && successMessage && (
          <span className="text-sm text-mint-700">{successMessage}</span>
        )}
        {error && <span className="text-sm text-coral-600">{error}</span>}
      </div>
    </form>
  );
}
