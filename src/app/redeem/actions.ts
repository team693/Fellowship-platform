"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Please sign in first, then redeem your code.",
  invalid_code: "That code isn't valid. Check for typos and try again.",
  code_used: "That code has already been redeemed by someone else.",
  code_revoked: "That code has been revoked. Contact your partner for a new one.",
  no_seats: "Your partner's seats are all used up. Contact them for more.",
  already_enrolled: "You already have access to this internship.",
};

export type RedeemResult =
  | { ok: true; fellowshipId: string; already?: boolean }
  | { ok: false; error: string };

export async function redeemCode(code: string): Promise<RedeemResult> {
  const trimmed = (code ?? "").trim();
  if (!trimmed) return { ok: false, error: "Enter a code to redeem." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: ERROR_MESSAGES.not_authenticated };

  // Atomic, race-safe redemption happens entirely in the DB (see migration 0005).
  const { data, error } = await supabase.rpc("redeem_enrollment_code", {
    p_code: trimmed,
  });

  if (error) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const result = data as {
    ok: boolean;
    error?: string;
    fellowship_id?: string;
    already?: boolean;
  };

  if (!result.ok) {
    return {
      ok: false,
      error: ERROR_MESSAGES[result.error ?? ""] ?? "Could not redeem this code.",
    };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    fellowshipId: result.fellowship_id!,
    already: result.already,
  };
}
