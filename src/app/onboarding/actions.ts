"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveOnboardingSelection(formData: FormData) {
  const lensId = String(formData.get("lens_id") ?? "").trim();
  const routeId = String(formData.get("route_id") ?? "").trim();
  if (!lensId || !routeId) {
    return { ok: false, error: "Choose one option for each question." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ lens_id: lensId, route_id: routeId })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
