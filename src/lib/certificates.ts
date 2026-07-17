import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface IssueResult {
  issued: boolean;
  certificateId?: string;
  reason?: string;
}

/**
 * Issues an immutable certificate IF, and only if, the user has genuinely
 * completed every REQUIRED module of the fellowship — checked against the
 * server-authored `progress` table (which clients cannot write).
 *
 * Idempotent: if a certificate already exists it is returned, never duplicated
 * (there is also a unique(user_id, fellowship_id) constraint as a backstop).
 *
 * Runs with the service role because it must read cross-table state and write
 * the certificate, but every input is derived from the DB, not the client.
 */
export async function issueCertificateIfEligible(
  userId: string,
  fellowshipId: string,
): Promise<IssueResult> {
  const admin = createAdminClient();

  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("fellowship_id", fellowshipId)
    .maybeSingle();
  if (!enrollment) return { issued: false, reason: "not_enrolled" };

  // Already issued? Return it (idempotent).
  const { data: existing } = await admin
    .from("certificates")
    .select("id")
    .eq("user_id", userId)
    .eq("fellowship_id", fellowshipId)
    .maybeSingle();
  if (existing) return { issued: true, certificateId: existing.id };

  const { data: modules } = await admin
    .from("modules")
    .select("id, is_required")
    .eq("fellowship_id", fellowshipId);

  const required = (modules ?? []).filter((m) => m.is_required);
  if (required.length === 0) return { issued: false, reason: "no_required_modules" };

  const { data: completedProgress } = await admin
    .from("progress")
    .select("module_id")
    .eq("user_id", userId)
    .eq("fellowship_id", fellowshipId)
    .eq("status", "completed");

  const completed = new Set((completedProgress ?? []).map((p) => p.module_id));
  const allDone = required.every((m) => completed.has(m.id));
  if (!allDone) return { issued: false, reason: "incomplete" };

  // Snapshot the recipient name + fellowship title so the record is immutable
  // and self-describing even if those change later.
  const [{ data: profile }, { data: fellowship }] = await Promise.all([
    admin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    admin.from("fellowships").select("title").eq("id", fellowshipId).maybeSingle(),
  ]);

  const recipientName =
    profile?.full_name?.trim() || profile?.email || "Internship Participant";
  const fellowshipTitle = fellowship?.title || "Heal Digital Internship";

  const { data: inserted, error } = await admin
    .from("certificates")
    .insert({
      user_id: userId,
      fellowship_id: fellowshipId,
      recipient_name: recipientName,
      fellowship_title: fellowshipTitle,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    // Likely a race on the unique constraint — fetch the winner.
    const { data: raced } = await admin
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("fellowship_id", fellowshipId)
      .maybeSingle();
    if (raced) return { issued: true, certificateId: raced.id };
    return { issued: false, reason: error.message };
  }

  return { issued: true, certificateId: inserted?.id };
}
