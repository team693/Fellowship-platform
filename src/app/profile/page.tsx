import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "./account-form";
import { SpotlightSection } from "./spotlight-section";
import { getSpotlightProfile } from "./spotlight-data";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  await requireUser();
  const profile = await getProfile();
  if (!profile) return null;

  const { spotlight, photoUrl } = await getSpotlightProfile();

  const supabase = await createClient();
  const [{ data: route }, { data: lens }] = await Promise.all([
    profile.route_id
      ? supabase.from("routes").select("title").eq("id", profile.route_id).maybeSingle()
      : Promise.resolve({ data: null }),
    profile.lens_id
      ? supabase.from("lenses").select("title").eq("id", profile.lens_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-extrabold">Your profile</h1>
        <p className="mt-1 text-ink-soft">
          Manage your account and optional participant spotlight.
        </p>

        <section className="card mt-8">
          <h2 className="text-lg font-bold">Account</h2>
          <p className="mb-5 mt-1 text-sm text-ink-soft">
            Your name and language preference.
          </p>
          <AccountForm profile={profile} />
        </section>

        <section className="card mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Your problem &amp; lens</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {route?.title ?? "Not chosen yet"} · {lens?.title ?? "Not chosen yet"}
              </p>
            </div>
            <Link href="/onboarding?edit=1" className="btn-ghost">
              Change
            </Link>
          </div>
        </section>

        <SpotlightSection
          initial={spotlight}
          initialPhotoUrl={photoUrl}
          fallbackName={profile.full_name}
        />
      </main>
    </div>
  );
}
