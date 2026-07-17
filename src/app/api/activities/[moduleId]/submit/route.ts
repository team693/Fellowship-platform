import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { issueCertificateIfEligible } from "@/lib/certificates";
import {
  gradeActivity,
  extractEssayText,
  type ActivitySpec,
  type AnswerMap,
} from "@/lib/activity";

/**
 * Server-grades a submission. The client sends ANSWERS ONLY — never a score.
 * The answer keys never leave the server, and progress is written server-side,
 * so a browser cannot fabricate a passing result.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;
  const body = await request.json().catch(() => ({}));
  const answers: AnswerMap =
    body && typeof body.answers === "object" && body.answers ? body.answers : {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }

  await ensureOpenAccessEnrollments(user.id);

  // RLS read confirms enrollment; gives fellowship_id + kind.
  const { data: mod } = await supabase
    .from("modules")
    .select("id, fellowship_id, kind")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod || mod.kind !== "activity") {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

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

  const spec = activity.spec as ActivitySpec;
  const result = gradeActivity(spec, answers);
  const essayText = extractEssayText(spec, answers);

  // Persist the submission (server-side only).
  await admin.from("submissions").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      fellowship_id: mod.fellowship_id,
      answers,
      score: result.score,
      essay_text: essayText,
      needs_review: result.needsReview,
    },
    { onConflict: "user_id,module_id" },
  );

  // Mark the module complete only when the server says it passed.
  let certificateId: string | null = null;
  if (result.passed) {
    await admin.from("progress").upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        fellowship_id: mod.fellowship_id,
        status: "completed",
        score: result.score,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id" },
    );
    const cert = await issueCertificateIfEligible(user.id, mod.fellowship_id);
    certificateId = cert.certificateId ?? null;
  }

  return NextResponse.json({
    ok: true,
    score: result.score,
    passed: result.passed,
    passScore: typeof spec.pass_score === "number" ? spec.pass_score : 70,
    essayOk: result.essayOk,
    perQuestion: result.perQuestion,
    certificateId,
  });
}
