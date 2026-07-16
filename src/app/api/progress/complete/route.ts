import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueCertificateIfEligible } from "@/lib/certificates";
import type { CompletionConfig, Module, Progress } from "@/lib/types";

/**
 * Marks a module complete AFTER server-side validation. This is the integrity
 * boundary that certificates depend on — the client is never trusted:
 *
 *   engagement rule -> verify the server-recorded dwell time meets the module's
 *                      min_seconds threshold before accepting completion.
 *   reported rule   -> treat the posted score as UNTRUSTED: clamp to [0,100]
 *                      and enforce the module's pass_score. A too-low score
 *                      does not complete the module.
 *
 * Progress is written with the service role because there is no client RLS
 * write policy on `progress` — so a browser can never fabricate completion.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
  const reportedScore = typeof body.score === "number" ? body.score : undefined;
  if (!moduleId) {
    return NextResponse.json({ ok: false, error: "Missing moduleId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }

  // RLS confirms enrollment; also gives us the completion rule + config.
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .maybeSingle();
  const mod = moduleRow as Module | null;
  if (!mod) {
    return NextResponse.json(
      { ok: false, error: "You don't have access to this module." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Ensure a progress row exists (carries started_at + fellowship_id).
  await admin.from("progress").upsert(
    {
      user_id: user.id,
      module_id: mod.id,
      fellowship_id: mod.fellowship_id,
      status: "in_progress",
    },
    { onConflict: "user_id,module_id", ignoreDuplicates: true },
  );

  const { data: existingRow } = await admin
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("module_id", mod.id)
    .maybeSingle();
  const existing = existingRow as Progress | null;

  // Already completed -> idempotent success.
  if (existing?.status === "completed") {
    return NextResponse.json({
      ok: true,
      status: "completed",
      score: existing.score,
      already: true,
    });
  }

  const config = (mod.completion_config ?? {}) as CompletionConfig;
  let finalScore: number | null = null;

  if (mod.completion_rule === "engagement") {
    const minSeconds =
      typeof config.min_seconds === "number" ? config.min_seconds : 20;
    const startedAt = existing?.started_at
      ? new Date(existing.started_at).getTime()
      : Date.now();
    const elapsedSeconds = (Date.now() - startedAt) / 1000;
    if (elapsedSeconds < minSeconds) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please spend a little more time on this module before completing it.",
          remaining: Math.ceil(minSeconds - elapsedSeconds),
        },
        { status: 400 },
      );
    }
  } else {
    // reported rule: score is untrusted input.
    if (reportedScore === undefined) {
      return NextResponse.json(
        { ok: false, error: "This module didn't report a valid result." },
        { status: 400 },
      );
    }
    finalScore = Math.max(0, Math.min(100, Math.round(reportedScore)));
    const passScore =
      typeof config.pass_score === "number" ? config.pass_score : null;
    if (passScore != null && finalScore < passScore) {
      return NextResponse.json(
        {
          ok: false,
          error: `You scored ${finalScore}. You need at least ${passScore} to pass.`,
          score: finalScore,
        },
        { status: 400 },
      );
    }
  }

  const { error: updateError } = await admin
    .from("progress")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      score: finalScore,
    })
    .eq("user_id", user.id)
    .eq("module_id", mod.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: "Could not save your progress. Please try again." },
      { status: 500 },
    );
  }

  // If this was the last required module, issue the certificate now.
  const cert = await issueCertificateIfEligible(user.id, mod.fellowship_id);

  return NextResponse.json({
    ok: true,
    status: "completed",
    score: finalScore,
    certificateId: cert.certificateId ?? null,
  });
}
