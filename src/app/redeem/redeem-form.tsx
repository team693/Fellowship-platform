"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemCode } from "./actions";

export function RedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await redeemCode(code);
          if (res.ok) {
            router.push(`/fellowships/${res.fellowshipId}`);
            router.refresh();
          } else {
            setError(res.error);
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="code" className="label">
          Seat code
        </label>
        <input
          id="code"
          name="code"
          className="input text-center font-mono text-lg uppercase tracking-[0.2em]"
          placeholder="HEAL-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full py-3"
        disabled={isPending || code.trim().length === 0}
      >
        {isPending ? "Redeeming…" : "Redeem & unlock internship"}
      </button>
      {error && (
        <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
