import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * OPEN ACCESS (launch phase).
 *
 * For now, any signed-in user can access every PUBLISHED internship — no seat
 * code or payment required. We implement this by auto-enrolling the user into
 * published internships, so the rest of the pipeline (module access via RLS,
 * server-validated progress, certificate issuance) keeps working unchanged.
 *
 * The seat-code system stays fully intact underneath. When paid access is
 * added later, set OPEN_ACCESS=false and gate enrollment behind payment/codes;
 * no other code needs to change.
 */
export function isOpenAccess(): boolean {
  return (process.env.OPEN_ACCESS ?? "true").toLowerCase() !== "false";
}

/**
 * Ensures the user is enrolled in every published internship (idempotent).
 * No-op when open access is disabled. Uses the service role because enrollments
 * are created server-side only (there is no client write policy).
 */
export async function ensureOpenAccessEnrollments(userId: string): Promise<void> {
  if (!isOpenAccess()) return;

  const admin = createAdminClient();
  const { data: published } = await admin
    .from("fellowships")
    .select("id")
    .eq("is_published", true);

  if (!published || published.length === 0) return;

  const rows = published.map((f) => ({ user_id: userId, fellowship_id: f.id }));
  await admin
    .from("enrollments")
    .upsert(rows, { onConflict: "user_id,fellowship_id", ignoreDuplicates: true });
}
