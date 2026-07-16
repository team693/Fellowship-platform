"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { SPOTLIGHT_CONSENT_SCOPE } from "@/lib/types";

type Result = { ok: boolean; error?: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function clamp(v: FormDataEntryValue | null, max: number): string | null {
  const s = String(v ?? "").trim().slice(0, max);
  return s || null;
}

/** Save the (optional) spotlight details. Does NOT change consent. */
export async function saveSpotlightDetails(formData: FormData): Promise<Result> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("spotlight_profiles").upsert(
    {
      user_id: user.id,
      display_name: clamp(formData.get("display_name"), 120),
      headline: clamp(formData.get("headline"), 160),
      short_bio: clamp(formData.get("short_bio"), 600),
      city: clamp(formData.get("city"), 80),
      country: clamp(formData.get("country"), 80),
      working_on: clamp(formData.get("working_on"), 300),
      quote: clamp(formData.get("quote"), 300),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

/** Upload/replace the spotlight photo into the user's own private folder. */
export async function uploadSpotlightPhoto(formData: FormData): Promise<Result> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Folder MUST be the user's id — the storage RLS policy checks this.
  const path = `${user.id}/spotlight-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(env.spotlightBucket())
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  // Remove the previous photo, if any.
  const { data: existing } = await supabase
    .from("spotlight_profiles")
    .select("photo_path")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing?.photo_path && existing.photo_path !== path) {
    await supabase.storage.from(env.spotlightBucket()).remove([existing.photo_path]);
  }

  const { error } = await supabase
    .from("spotlight_profiles")
    .upsert({ user_id: user.id, photo_path: path }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}

/** Hard-delete the photo from Storage and clear the reference. */
export async function deleteSpotlightPhoto(): Promise<Result> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("spotlight_profiles")
    .select("photo_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.photo_path) {
    await supabase.storage.from(env.spotlightBucket()).remove([existing.photo_path]);
  }
  const { error } = await supabase
    .from("spotlight_profiles")
    .update({ photo_path: null })
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}

/**
 * Record explicit, deliberate consent. The consent checkbox must have been
 * actively ticked (never pre-selected, never bundled with anything else).
 */
export async function grantSpotlightConsent(formData: FormData): Promise<Result> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (formData.get("consent") !== "on") {
    return { ok: false, error: "Please tick the consent box to opt in." };
  }

  const { error } = await supabase.from("spotlight_profiles").upsert(
    {
      user_id: user.id,
      consent_status: "granted",
      consent_scope: SPOTLIGHT_CONSENT_SCOPE,
      consent_granted_at: new Date().toISOString(),
      consent_withdrawn_at: null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

/** Withdraw consent. The record + photo are kept, but status flips to
 * withdrawn so the student immediately leaves the admin spotlight queue. */
export async function withdrawSpotlightConsent(): Promise<Result> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("spotlight_profiles")
    .update({
      consent_status: "withdrawn",
      consent_withdrawn_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}
