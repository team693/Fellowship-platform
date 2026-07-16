import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { Profile, SpotlightProfile } from "@/lib/types";

/**
 * Admin spotlight queue. RLS returns ONLY rows where consent_status='granted',
 * and the storage policy only lets admins sign URLs for consenting students —
 * so non-consenting students never appear here and their photos are never
 * readable.
 */
export default async function AdminSpotlightPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("spotlight_profiles")
    .select("*")
    .eq("consent_status", "granted")
    .order("consent_granted_at", { ascending: false });
  const rows = (data as SpotlightProfile[]) ?? [];

  const userIds = rows.map((r) => r.user_id);
  const profilesById = new Map<string, Profile>();
  if (userIds.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);
    for (const p of (profs as Profile[]) ?? []) profilesById.set(p.id, p);
  }

  const withPhotos = await Promise.all(
    rows.map(async (r) => {
      let photoUrl: string | null = null;
      if (r.photo_path) {
        const { data: signed } = await supabase.storage
          .from(env.spotlightBucket())
          .createSignedUrl(r.photo_path, 60 * 30);
        photoUrl = signed?.signedUrl ?? null;
      }
      return { row: r, photoUrl, profile: profilesById.get(r.user_id) ?? null };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Spotlight queue</h1>
      <p className="mt-1 text-ink-soft">
        Students who have explicitly consented to be featured on LinkedIn and
        Heal channels. Only consenting students appear here. Posting is manual.
      </p>

      {withPhotos.length === 0 ? (
        <div className="card mt-6 text-center text-ink-muted">
          No students have opted in yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withPhotos.map(({ row, photoUrl, profile }) => (
            <div key={row.id} className="card">
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted text-xl">
                    🙂
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {row.display_name || profile?.full_name || "Unnamed"}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {row.headline || "—"}
                  </p>
                </div>
              </div>

              {(row.city || row.country) && (
                <p className="mt-3 text-sm text-ink-soft">
                  📍 {[row.city, row.country].filter(Boolean).join(", ")}
                </p>
              )}
              {row.short_bio && (
                <p className="mt-2 text-sm text-ink-soft">{row.short_bio}</p>
              )}
              {row.working_on && (
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="font-semibold">Working on:</span> {row.working_on}
                </p>
              )}
              {row.quote && (
                <p className="mt-2 text-sm italic text-ink-soft">“{row.quote}”</p>
              )}

              <div className="mt-4 border-t border-surface-muted pt-3 text-xs text-ink-muted">
                <p>{profile?.email}</p>
                <p className="mt-1">
                  Consented{" "}
                  {row.consent_granted_at
                    ? new Date(row.consent_granted_at).toLocaleDateString()
                    : "—"}
                </p>
                <p className="mt-1 italic">Scope: {row.consent_scope}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
