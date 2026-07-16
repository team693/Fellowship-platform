import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Module } from "@/lib/types";

/**
 * Records that the user has OPENED a module, stamping started_at server-side.
 * This timestamp is the basis for engagement dwell-time validation — the
 * client cannot backdate it. Idempotent: never resets an existing row.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
  if (!moduleId) {
    return NextResponse.json({ ok: false, error: "Missing moduleId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  // Reading the module via the user client also confirms enrollment (RLS).
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("id, fellowship_id")
    .eq("id", moduleId)
    .maybeSingle();
  const mod = moduleRow as Pick<Module, "id" | "fellowship_id"> | null;
  if (!mod) {
    return NextResponse.json({ ok: false, error: "No access" }, { status: 403 });
  }

  // Progress is written ONLY server-side (no client RLS write policy).
  const admin = createAdminClient();
  await admin.from("progress").upsert(
    {
      user_id: user.id,
      module_id: mod.id,
      fellowship_id: mod.fellowship_id,
      status: "in_progress",
    },
    { onConflict: "user_id,module_id", ignoreDuplicates: true },
  );

  return NextResponse.json({ ok: true });
}
