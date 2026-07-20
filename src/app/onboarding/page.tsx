import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./onboarding-wizard";
import type { Lens, Route } from "@/lib/types";

export const metadata = { title: "Get started" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const { edit } = await searchParams;

  const [{ data: profile }, { data: lensRows }, { data: routeRows }] = await Promise.all([
    supabase.from("profiles").select("route_id, lens_id").eq("id", user.id).maybeSingle(),
    supabase.from("lenses").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("routes").select("*").eq("is_active", true).order("sort_order"),
  ]);

  // Already onboarded — no need to pick again, unless explicitly changing it.
  if (profile?.route_id && profile?.lens_id && !edit) redirect("/dashboard");

  const lenses = (lensRows as Lens[]) ?? [];
  const routes = (routeRows as Route[]) ?? [];

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <main className="mx-auto max-w-2xl px-6 py-14">
        <OnboardingWizard lenses={lenses} routes={routes} />
      </main>
    </div>
  );
}
