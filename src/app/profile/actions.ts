"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/types";

export async function updateAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const full_name = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale: Locale = localeRaw === "ur" ? "ur" : "en";

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name || null, locale })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
