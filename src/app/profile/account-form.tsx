"use client";

import { useState, useTransition } from "react";
import { updateAccount } from "./actions";
import type { Profile } from "@/lib/types";

export function AccountForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        setSaved(false);
        setError(null);
        startTransition(async () => {
          const res = await updateAccount(formData);
          if (res.ok) setSaved(true);
          else setError(res.error ?? "Could not save.");
        });
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="full_name" className="label">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          className="input"
          defaultValue={profile.full_name ?? ""}
          placeholder="Your name (as it should appear on your certificate)"
          maxLength={120}
        />
        <p className="mt-1 text-xs text-ink-muted">
          This is the name printed on your certificate.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          className="input bg-surface-subtle text-ink-muted"
          value={profile.email}
          disabled
        />
      </div>

      <div>
        <label htmlFor="locale" className="label">
          Language preference
        </label>
        <select
          id="locale"
          name="locale"
          className="input"
          defaultValue={profile.locale}
        >
          <option value="en">English</option>
          <option value="ur">اردو (Urdu)</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-mint-700">Saved ✓</span>}
        {error && <span className="text-sm text-coral-600">{error}</span>}
      </div>
    </form>
  );
}
