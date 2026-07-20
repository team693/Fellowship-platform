"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveOnboardingSelection } from "./actions";
import type { Lens, Route } from "@/lib/types";

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending || !canSubmit}>
      {pending ? "Saving…" : "Start your program"}
    </button>
  );
}

export function OnboardingWizard({
  lenses,
  routes,
}: {
  lenses: Lens[];
  routes: Route[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [lensId, setLensId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <span className={step === 1 ? "text-teal-700" : ""}>1. About you</span>
        <span>—</span>
        <span className={step === 2 ? "text-teal-700" : ""}>2. Your problem</span>
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-extrabold">Which best describes you?</h1>
          <p className="mt-1 text-ink-soft">
            This shapes how we frame the ethics scenarios and case studies you&apos;ll see.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {lenses.map((lens) => (
              <button
                key={lens.id}
                type="button"
                onClick={() => {
                  setLensId(lens.id);
                  setStep(2);
                }}
                className={`card text-left transition-colors hover:border-teal-300 ${
                  lensId === lens.id ? "border-teal-400 bg-teal-50" : ""
                }`}
              >
                <p className="font-bold text-ink">{lens.title}</p>
                {lens.description && (
                  <p className="mt-1 text-sm text-ink-soft">{lens.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-4 text-sm text-ink-muted hover:text-ink"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold">Which problem do you want to work on?</h1>
          <p className="mt-1 text-ink-soft">
            Each is built on real Karachi data. You can only pick one for now.
          </p>
          <form
            action={async (formData) => {
              setError(null);
              const res = await saveOnboardingSelection(formData);
              if (res && !res.ok) setError(res.error ?? "Something went wrong.");
            }}
          >
            <input type="hidden" name="lens_id" value={lensId ?? ""} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {routes.map((route) => (
                <label
                  key={route.id}
                  className={`card cursor-pointer text-left transition-colors hover:border-teal-300 ${
                    routeId === route.id ? "border-teal-400 bg-teal-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="route_id"
                    value={route.id}
                    className="sr-only"
                    checked={routeId === route.id}
                    onChange={() => setRouteId(route.id)}
                  />
                  <p className="font-bold text-ink">{route.title}</p>
                  {route.description && (
                    <p className="mt-1 text-sm text-ink-soft">{route.description}</p>
                  )}
                </label>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-coral-600">{error}</p>}
            <div className="mt-6">
              <SubmitButton canSubmit={!!routeId} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
