"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * All admin mutations. RLS already restricts these tables to admins, but we
 * also assert admin here to fail fast with a clear error rather than a silent
 * RLS denial.
 */
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { supabase, ok: false as const, error: "Admins only." };
  }
  return { supabase, ok: true as const };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

function randomChunk(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function generateCode(): string {
  return `HEAL-${randomChunk(4)}-${randomChunk(4)}`;
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------
export async function createPartner(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Partner name is required." };

  const seats = Math.max(0, parseInt(String(formData.get("seats_purchased") ?? "0"), 10) || 0);

  const { data, error } = await gate.supabase
    .from("partners")
    .insert({
      name,
      contact_name: String(formData.get("contact_name") ?? "").trim() || null,
      contact_email: String(formData.get("contact_email") ?? "").trim() || null,
      seats_purchased: seats,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/partners");
  redirect(`/admin/partners/${data!.id}`);
}

export async function updatePartnerSeats(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = String(formData.get("partner_id") ?? "");
  const seats = Math.max(0, parseInt(String(formData.get("seats_purchased") ?? "0"), 10) || 0);
  const { error } = await gate.supabase
    .from("partners")
    .update({ seats_purchased: seats })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/partners/${id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Enrollment codes
// ---------------------------------------------------------------------------
export async function generateCodes(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const partnerId = String(formData.get("partner_id") ?? "");
  const fellowshipId = String(formData.get("fellowship_id") ?? "");
  const count = Math.min(500, Math.max(1, parseInt(String(formData.get("count") ?? "1"), 10) || 1));
  if (!partnerId || !fellowshipId) {
    return { ok: false, error: "Choose a partner and an internship." };
  }

  // Generate unique codes; retry the whole batch a few times on the (rare)
  // unique-constraint collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = Array.from({ length: count }, () => ({
      code: generateCode(),
      partner_id: partnerId,
      fellowship_id: fellowshipId,
    }));
    const { error } = await gate.supabase.from("enrollment_codes").insert(rows);
    if (!error) {
      revalidatePath(`/admin/partners/${partnerId}`);
      return { ok: true, count };
    }
    if (!/duplicate|unique/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "Could not generate unique codes, please retry." };
}

export async function revokeCode(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = String(formData.get("code_id") ?? "");
  const partnerId = String(formData.get("partner_id") ?? "");
  // Only unused codes can be revoked (don't strip access from a redeemed seat).
  const { error } = await gate.supabase
    .from("enrollment_codes")
    .update({ status: "revoked" })
    .eq("id", id)
    .eq("status", "unused");
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/partners/${partnerId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Fellowships
// ---------------------------------------------------------------------------
export async function createFellowship(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!title || !slug) return { ok: false, error: "Title and slug are required." };

  const { data, error } = await gate.supabase
    .from("fellowships")
    .insert({
      title,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      locale: String(formData.get("locale") ?? "en") === "ur" ? "ur" : "en",
      cover_color: String(formData.get("cover_color") ?? "").trim() || null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/fellowships");
  redirect(`/admin/fellowships/${data!.id}`);
}

export async function updateFellowship(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = String(formData.get("fellowship_id") ?? "");
  const { error } = await gate.supabase
    .from("fellowships")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      locale: String(formData.get("locale") ?? "en") === "ur" ? "ur" : "en",
      cover_color: String(formData.get("cover_color") ?? "").trim() || null,
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/fellowships/${id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------
export async function createModule(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const fellowshipId = String(formData.get("fellowship_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const assetPath = String(formData.get("asset_path") ?? "").trim();
  if (!fellowshipId || !title || !assetPath) {
    return { ok: false, error: "Title and asset file are required." };
  }
  if (!/^[a-zA-Z0-9._-]+\.html$/.test(assetPath)) {
    return { ok: false, error: "Asset must be a .html filename under public/simulations." };
  }

  const completionRule =
    String(formData.get("completion_rule") ?? "engagement") === "reported"
      ? "reported"
      : "engagement";
  const minSeconds = parseInt(String(formData.get("min_seconds") ?? ""), 10);
  const passScore = parseInt(String(formData.get("pass_score") ?? ""), 10);
  const completionConfig: Record<string, number> = {};
  if (completionRule === "engagement" && !Number.isNaN(minSeconds)) {
    completionConfig.min_seconds = Math.max(0, minSeconds);
  }
  if (completionRule === "reported" && !Number.isNaN(passScore)) {
    completionConfig.pass_score = Math.max(0, Math.min(100, passScore));
  }

  // Next order_index.
  const { data: existing } = await gate.supabase
    .from("modules")
    .select("order_index")
    .eq("fellowship_id", fellowshipId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextIndex = existing && existing.length ? existing[0].order_index + 1 : 0;

  const { error } = await gate.supabase.from("modules").insert({
    fellowship_id: fellowshipId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    type: String(formData.get("type") ?? "explore"),
    asset_path: assetPath,
    completion_rule: completionRule,
    completion_config: completionConfig,
    is_required: formData.get("is_required") !== "off",
    order_index: nextIndex,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/fellowships/${fellowshipId}`);
  return { ok: true };
}

export async function deleteModule(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = String(formData.get("module_id") ?? "");
  const fellowshipId = String(formData.get("fellowship_id") ?? "");
  const { error } = await gate.supabase.from("modules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/fellowships/${fellowshipId}`);
  return { ok: true };
}

export async function reorderModule(formData: FormData) {
  const gate = await assertAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = String(formData.get("module_id") ?? "");
  const fellowshipId = String(formData.get("fellowship_id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const { data: mods } = await gate.supabase
    .from("modules")
    .select("id, order_index")
    .eq("fellowship_id", fellowshipId)
    .order("order_index", { ascending: true });
  if (!mods) return { ok: false, error: "Not found." };

  const idx = mods.findIndex((m) => m.id === id);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= mods.length) return { ok: true };

  const a = mods[idx];
  const b = mods[swapWith];
  // Swap via a temporary index to avoid tripping the unique(fellowship, order).
  await gate.supabase.from("modules").update({ order_index: -1 }).eq("id", a.id);
  await gate.supabase.from("modules").update({ order_index: a.order_index }).eq("id", b.id);
  await gate.supabase.from("modules").update({ order_index: b.order_index }).eq("id", a.id);

  revalidatePath(`/admin/fellowships/${fellowshipId}`);
  return { ok: true };
}
