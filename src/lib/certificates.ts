import "server-only";

import { getProgramStructure } from "@/lib/program";
import { createAdminClient } from "@/lib/supabase/admin";

export interface IssueResult {
  issued: boolean;
  certificateId?: string;
  reason?: string;
}

/**
 * Issues an immutable certificate IF, and only if, the user has genuinely
 * finished the program — the compulsory week-1 core plus the required number
 * of topics (see src/lib/program.ts). Checked against the server-authored
 * `progress` table, which clients cannot write.
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

  const [{ data: modules }, { data: progressRows }, { data: routes }] =
    await Promise.all([
      admin
        .from("modules")
        .select("id, route_id, is_required, order_index")
        .eq("fellowship_id", fellowshipId),
      admin
        .from("progress")
        .select("module_id, status")
        .eq("user_id", userId)
        .eq("fellowship_id", fellowshipId),
      admin.from("routes").select("id, sort_order").eq("is_active", true),
    ]);

  const structure = getProgramStructure(
    modules ?? [],
    progressRows ?? [],
    routes ?? [],
  );

  // No topics authored yet means there is nothing to certify against.
  if (structure.topicsRequired === 0) {
    return { issued: false, reason: "no_topics" };
  }
  if (!structure.isComplete) return { issued: false, reason: "incomplete" };

  // Snapshot the recipient name + fellowship title so the record is immutable
  // and self-describing even if those change later.
  const [{ data: profile }, { data: fellowship }] = await Promise.all([
    admin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    admin.from("fellowships").select("title").eq("id", fellowshipId).maybeSingle(),
  ]);

  const recipientName =
    profile?.full_name?.trim() || profile?.email || "Solutions Builder";
  const fellowshipTitle = fellowship?.title || "IESP";

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
