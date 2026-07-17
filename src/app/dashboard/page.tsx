import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Enrollment, Fellowship, Module, Progress } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const isGuest = !!user.is_anonymous;
  // Launch phase: auto-enroll signed-in users into published internships.
  await ensureOpenAccessEnrollments(user.id);
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS ensures every query below only returns the current user's rows.
  const [{ data: enrollments }, { data: certificates }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, fellowship_id, created_at")
      .order("created_at", { ascending: true }),
    supabase.from("certificates").select("*"),
  ]);

  const fellowshipIds = (enrollments ?? []).map((e) => e.fellowship_id);

  let fellowships: Fellowship[] = [];
  let modules: Module[] = [];
  let progress: Progress[] = [];

  if (fellowshipIds.length > 0) {
    const [{ data: f }, { data: m }, { data: p }] = await Promise.all([
      supabase.from("fellowships").select("*").in("id", fellowshipIds),
      supabase.from("modules").select("*").in("fellowship_id", fellowshipIds),
      supabase.from("progress").select("*").in("fellowship_id", fellowshipIds),
    ]);
    fellowships = (f as Fellowship[]) ?? [];
    modules = (m as Module[]) ?? [];
    progress = (p as Progress[]) ?? [];
  }

  const certByFellowship = new Map(
    ((certificates as Certificate[]) ?? []).map((c) => [c.fellowship_id, c]),
  );

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} isGuest={isGuest} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {isGuest && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4">
            <span className="text-xl">👋</span>
            <p className="flex-1 text-sm text-gold-900">
              You&apos;re exploring as a <strong>guest</strong>. Look around
              freely — but your progress won&apos;t be saved and you can&apos;t
              earn a certificate until you sign in.
            </p>
            <Link href="/login" className="btn-primary">
              Sign in to save
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-ink-soft">Your internships and progress.</p>
          </div>
        </div>

        {(enrollments ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {fellowships.map((fellowship) => (
              <FellowshipCard
                key={fellowship.id}
                fellowship={fellowship}
                modules={modules.filter((m) => m.fellowship_id === fellowship.id)}
                progress={progress.filter((p) => p.fellowship_id === fellowship.id)}
                certificate={certByFellowship.get(fellowship.id) ?? null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card mt-8 flex flex-col items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-heal-gradient text-2xl text-white">
        🎓
      </div>
      <h2 className="mt-4 text-xl font-bold">No internships available yet</h2>
      <p className="mt-1 max-w-md text-ink-soft">
        Your internships will appear here as soon as they&apos;re published.
        Check back soon.
      </p>
    </div>
  );
}

function FellowshipCard({
  fellowship,
  modules,
  progress,
  certificate,
}: {
  fellowship: Fellowship;
  modules: Module[];
  progress: Progress[];
  certificate: Certificate | null;
}) {
  const required = modules.filter((m) => m.is_required);
  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.module_id),
  );
  const completedRequired = required.filter((m) => completedIds.has(m.id)).length;
  const pct = required.length
    ? Math.round((completedRequired / required.length) * 100)
    : 0;
  const done = required.length > 0 && completedRequired === required.length;

  return (
    <div className="card flex flex-col">
      <div
        className="-m-6 mb-4 h-2 rounded-t-2xl"
        style={{ backgroundColor: fellowship.cover_color ?? "#0f8b80" }}
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{fellowship.title}</h3>
        {done && (
          <span className="badge bg-mint-100 text-mint-800">Completed</span>
        )}
      </div>
      {fellowship.description && (
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
          {fellowship.description}
        </p>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">
            {completedRequired}/{required.length} required modules
          </span>
          <span className="font-semibold text-teal-700">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-heal-gradient transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href={`/fellowships/${fellowship.id}`} className="btn-primary flex-1">
          {pct > 0 ? "Continue" : "Start"}
        </Link>
        {certificate ? (
          <Link
            href={`/certificates/${certificate.id}`}
            className="btn-ghost"
          >
            Certificate
          </Link>
        ) : null}
      </div>
    </div>
  );
}
