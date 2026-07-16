import "server-only";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { SpotlightProfile } from "@/lib/types";

/** Loads the current user's spotlight row + a short-lived signed photo URL. */
export async function getSpotlightProfile(): Promise<{
  spotlight: SpotlightProfile | null;
  photoUrl: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { spotlight: null, photoUrl: null };

  const { data } = await supabase
    .from("spotlight_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const spotlight = data as SpotlightProfile | null;

  let photoUrl: string | null = null;
  if (spotlight?.photo_path) {
    const { data: signed } = await supabase.storage
      .from(env.spotlightBucket())
      .createSignedUrl(spotlight.photo_path, 60 * 60);
    photoUrl = signed?.signedUrl ?? null;
  }

  return { spotlight, photoUrl };
}
