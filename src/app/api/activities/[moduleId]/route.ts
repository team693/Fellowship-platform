import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { toPublicActivity, type ActivitySpec } from "@/lib/activity";

/**
 * Returns the student-facing activity (answer keys stripped) plus the student's
 * own prior submission, if any. Enrollment is enforced via the modules RLS read.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  await ensureOpenAccessEnrollments(user.id);

  const { data: mod } = await supabase
    .from("modules")
    .select("id, fellowship_id, kind")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod || mod.kind !== "activity") {
    return NextResponse.json({ ok: false, error: "No access" }, { status: 403 });
  }

  // Activity spec is admin/service-only — load it server-side and strip answers.
  const admin = createAdminClient();
  const { data: activity } = await admin
    .from("activities")
    .select("spec")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (!activity) {
    return NextResponse.json(
      { ok: false, error: "This activity has no content yet." },
      { status: 404 },
    );
  }

  const publicActivity = toPublicActivity(activity.spec as ActivitySpec);

  const { data: submission } = await supabase
    .from("submissions")
    .select("answers, score, needs_review, updated_at")
    .eq("module_id", moduleId)
    .maybeSingle();

  return NextResponse.json({ ok: true, activity: publicActivity, submission });
}
