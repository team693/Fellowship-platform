"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * "Explore as guest" — signs in anonymously (Supabase Anonymous Auth) so the
 * visitor gets a real session and can navigate the whole student experience
 * without creating an account. Admin remains protected (a guest is not an
 * admin). Requires "Anonymous sign-ins" enabled in the Supabase dashboard.
 */
export function GuestButton({
  className = "btn-ghost",
  label = "Explore as guest",
  next = "/dashboard",
}: {
  className?: string;
  label?: string;
  next?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const supabase = createClient();
            const { error } = await supabase.auth.signInAnonymously();
            if (error) {
              setError(
                "Guest access isn't enabled yet. An admin can turn on Anonymous sign-ins in Supabase.",
              );
              return;
            }
            router.push(next);
            router.refresh();
          });
        }}
      >
        {pending ? "Entering…" : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-coral-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
