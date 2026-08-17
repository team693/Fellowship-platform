import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProgressRing } from "@/components/progress-ring";
import { requireUser, getProfile } from "@/lib/auth";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { getNextModule, getProgramStructure } from "@/lib/program";
import { createClient } from "@/lib/supabase/server";
import type {
  Certificate,
  Fellowship,
  Module,
  Progress,
  Route,
} from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const isGuest = !!user.is_anonymous;
  // Launch phase: auto-enroll signed-in users into published programs.
  await ensureOpenAccessEnrollments(user.id);
  const profile = await getProfile();
  // Onboarding (lens + route) is required before entering the program.
  if (profile && (!profile.route_id || !profile.lens_id)) redirect("/onboarding");
  const supabase = await createClient();

  // RLS ensures every query below only returns the current user's rows.
  const [{ data: enrollments }, { data: certificates }, { data: routeRows }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, fellowship_id, created_at")
        .order("created_at", { ascending: true }),
      supabase.from("certificates").select("*"),
      supabase.from("routes").select("*").eq("is_active", true),
    ]);

  const routes = (routeRows as Route[]) ?? [];

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

  // "Continue where you left off": the next module in the first programme that
  // is underway but not finished. One nudge, not a feed.
  let nextUp: {
    fellowship: Fellowship;
    module: Module;
    percent: number;
    started: boolean;
  } | null = null;
  for (const fellowship of fellowships) {
    const fMods = modules.filter((m) => m.fellowship_id === fellowship.id);
    const fProg = progress.filter((p) => p.fellowship_id === fellowship.id);
    const structure = getProgramStructure(fMods, fProg, routes);
    if (structure.isComplete) continue;
    const mod = getNextModule(structure, fProg);
    if (mod) {
      nextUp = {
        fellowship,
        module: mod,
        percent: structure.percent,
        started: structure.percent > 0,
      };
      break;
    }
  }

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} isGuest={isGuest} />
      <main className="mx-auto max-w-6xl px-6 py-8">
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
            <p className="mt-1 text-ink-soft">Your programs and progress.</p>
          </div>
        </div>

        {nextUp && (
          <Link
            href={`/modules/${nextUp.module.id}`}
            className="card-interactive rise-in mt-6 flex items-center gap-5 border-teal-100 bg-gradient-to-r from-teal-50/70 to-white"
          >
            <div className="relative grid shrink-0 place-items-center">
              <ProgressRing percent={nextUp.percent} size={64} />
              <span className="absolute text-sm font-bold text-teal-700">
                {nextUp.percent}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700">
                {nextUp.started ? "Continue where you left off" : "Start here"}
              </p>
              <p className="mt-0.5 truncate font-display text-lg font-bold">
                {nextUp.module.title}
              </p>
              <p className="truncate text-sm text-ink-muted">
                {nextUp.fellowship.title}
              </p>
            </div>
            <span className="btn-primary hidden shrink-0 sm:inline-flex">
              {nextUp.started ? "Continue" : "Begin"} →
            </span>
          </Link>
        )}

        {(enrollments ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fellowships.map((fellowship) => (
              <FellowshipCard
                key={fellowship.id}
                fellowship={fellowship}
                modules={modules.filter((m) => m.fellowship_id === fellowship.id)}
                progress={progress.filter((p) => p.fellowship_id === fellowship.id)}
                routes={routes}
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
      <h2 className="mt-4 text-xl font-bold">No programs available yet</h2>
      <p className="mt-1 max-w-md text-ink-soft">
        Your programs will appear here as soon as they&apos;re published.
        Check back soon.
      </p>
    </div>
  );
}

function FellowshipCard({
  fellowship,
  modules,
  progress,
  routes,
  certificate,
}: {
  fellowship: Fellowship;
  modules: Module[];
  progress: Progress[];
  routes: Route[];
  certificate: Certificate | null;
}) {
  const structure = getProgramStructure(modules, progress, routes);
  const pct = structure.percent;
  const done = structure.isComplete;

  // One line of context under the bar: where you are, what it earns you.
  const momentum = done
    ? "Complete — your certificate is ready."
    : pct === 0
      ? "Everything's ready. Week 1 takes about 40 minutes."
      : pct < 50
        ? "You're building momentum."
        : "Over halfway to your Impact Certification.";

  return (
    <div className="card-interactive flex flex-col">
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
            Core {structure.coreCompleted}/{structure.coreRequired}
            <span className="mx-1.5 text-surface-muted">·</span>
            Topics {structure.topicsCompleted}/{structure.topicsRequired}
          </span>
          <span className="font-semibold text-teal-700">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="progress-fill h-full rounded-full bg-heal-gradient"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted">{momentum}</p>
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
