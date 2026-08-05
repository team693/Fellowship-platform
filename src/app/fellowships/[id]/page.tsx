import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SdgChips, SdgCoverage } from "@/components/sdg-badges";
import { SdgWall } from "@/components/sdg-wall";
import { requireUser, getProfile } from "@/lib/auth";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { getProgramStructure, type TopicProgress } from "@/lib/program";
import { createClient } from "@/lib/supabase/server";
import type {
  Certificate,
  Fellowship,
  Module,
  Progress,
  Route,
} from "@/lib/types";

export const metadata = { title: "Program" };

const TYPE_LABEL: Record<Module["type"], string> = {
  explore: "Explore",
  assessed: "Assessed",
  case_study: "Case study",
  quiz: "Quiz",
};

export default async function FellowshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  await ensureOpenAccessEnrollments(user.id);
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: fellowshipRow } = await supabase
    .from("fellowships")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const fellowship = fellowshipRow as Fellowship | null;
  if (!fellowship) notFound();

  // Confirm enrollment (admins may preview without enrollment).
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("fellowship_id", id)
    .maybeSingle();

  if (!enrollment && profile?.role !== "admin") {
    // Not enrolled (e.g. an unpublished program under open access).
    redirect("/dashboard");
  }

  const [
    { data: moduleRows },
    { data: progressRows },
    { data: certRow },
    { data: routeRows },
  ] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .eq("fellowship_id", id)
      .order("order_index", { ascending: true }),
    supabase.from("progress").select("*").eq("fellowship_id", id),
    supabase
      .from("certificates")
      .select("*")
      .eq("fellowship_id", id)
      .maybeSingle(),
    supabase.from("routes").select("*").eq("is_active", true),
  ]);

  const modules = (moduleRows as Module[]) ?? [];
  const progress = (progressRows as Progress[]) ?? [];
  const certificate = certRow as Certificate | null;
  const routes = (routeRows as Route[]) ?? [];

  const progressByModule = new Map(progress.map((p) => [p.module_id, p]));
  const structure = getProgramStructure(modules, progress, routes);

  // SDG coverage: all SDGs in the program vs. those the student has covered.
  const allSdgs = [...new Set(modules.flatMap((m) => m.sdgs ?? []))].sort(
    (a, b) => a - b,
  );
  const coveredSdgs = [
    ...new Set(
      modules
        .filter((m) => progressByModule.get(m.id)?.status === "completed")
        .flatMap((m) => m.sdgs ?? []),
    ),
  ].sort((a, b) => a - b);

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <SdgWall />
      {/* The wall is fixed at z-0, so the reading column has to sit above it. */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
          ← Dashboard
        </Link>

        <div className="mt-3">
          <h1 className="text-3xl font-extrabold">{fellowship.title}</h1>
          {fellowship.description && (
            <p className="mt-2 max-w-2xl text-ink-soft">
              {fellowship.description}
            </p>
          )}
          <p className="mt-3 text-sm text-ink-muted">
            Four weeks. Week 1 is the core everyone does. In weeks 2&ndash;4 you
            complete any{" "}
            <strong className="text-ink-soft">{structure.topicsRequired}</strong>{" "}
            topics of your choice.
          </p>
        </div>

        {/* Overall progress */}
        <div className="mt-6 rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">
              Week 1 core {structure.coreCompleted}/{structure.coreRequired}
              <span className="mx-2 text-surface-muted">·</span>
              Topics {structure.topicsCompleted}/{structure.topicsRequired}
            </span>
            <span className="font-semibold text-teal-700">
              {structure.percent}%
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-heal-gradient transition-all"
              style={{ width: `${structure.percent}%` }}
            />
          </div>

          {structure.isComplete && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-mint-50 p-4">
              <span className="text-xl">🎉</span>
              <p className="flex-1 text-sm text-mint-800">
                Core complete and {structure.topicsCompleted} topics finished.
                You&apos;re done.
              </p>
              {certificate ? (
                <Link
                  href={`/certificates/${certificate.id}`}
                  className="btn-primary"
                >
                  View certificate
                </Link>
              ) : (
                <Link
                  href={`/fellowships/${id}/complete`}
                  className="btn-primary"
                >
                  Claim your certificate
                </Link>
              )}
            </div>
          )}
        </div>

        {/* SDG coverage */}
        {allSdgs.length > 0 && (
          <div className="mt-4 rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
            <SdgCoverage allSdgs={allSdgs} coveredSdgs={coveredSdgs} />
          </div>
        )}

        {/* ---- Week 1: compulsory core ---------------------------------- */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-extrabold">Week 1 &middot; Core</h2>
            <span className="text-sm text-ink-muted">
              Compulsory for everyone
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            AI literacy, professional ethics, and Karachi as a living lab. Start
            here.
          </p>

          {structure.coreModules.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {structure.coreModules.map((mod, i) => (
                <ModuleRow
                  key={mod.id}
                  mod={mod}
                  index={i}
                  progress={progressByModule.get(mod.id)}
                />
              ))}
            </ol>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-surface-muted bg-surface-subtle p-5 text-sm text-ink-muted">
              The core curriculum is being written. It&apos;ll appear here before
              the cohort starts — you can begin your topics now.
            </div>
          )}
        </section>

        {/* ---- Weeks 2-4: topic catalogue -------------------------------- */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-extrabold">Weeks 2&ndash;4 &middot; Topics</h2>
            <span className="text-sm font-semibold text-teal-700">
              {structure.topicsCompleted} of {structure.topicsRequired} complete
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Complete any {structure.topicsRequired} of these{" "}
            {structure.topics.length}. Roughly one per week.
          </p>

          <div className="mt-4 space-y-4">
            {structure.topics.map((topic) => (
              <TopicCard
                key={topic.route.id}
                topic={topic}
                progressByModule={progressByModule}
                isPrimary={profile?.route_id === topic.route.id}
              />
            ))}
            {structure.topics.length === 0 && (
              <div className="card text-center text-ink-muted">
                No topics have been added to this program yet.
              </div>
            )}
          </div>
        </section>

        {/* ---- Capstone -------------------------------------------------- */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Capstone</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Your final deliverable, built on your primary topic and published to
            your portfolio.
          </p>
          <div className="mt-4 rounded-2xl border border-dashed border-surface-muted bg-surface-subtle p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-lg">
                🎬
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">
                    Capstone video pitch
                  </p>
                  <span className="badge bg-gold-50 text-gold-900">
                    Coming soon
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  A two-minute recorded pitch of your capstone — yours to keep
                  and show employers. This is a program deliverable, not an
                  assessment gate. Recording opens later in the cohort.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TopicCard({
  topic,
  progressByModule,
  isPrimary,
}: {
  topic: TopicProgress<Module, Route>;
  progressByModule: Map<string, Progress>;
  isPrimary: boolean;
}) {
  const pct = Math.round(topic.fraction * 100);

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-card ${
        topic.isComplete ? "border-mint-300" : "border-surface-muted"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink">{topic.route.title}</h3>
            {topic.isComplete && (
              <span className="badge bg-mint-100 text-mint-800">Complete</span>
            )}
            {isPrimary && (
              <span className="badge bg-teal-50 text-teal-700">
                Your capstone topic
              </span>
            )}
          </div>
          {topic.route.description && (
            <p className="mt-1 max-w-xl text-sm text-ink-soft">
              {topic.route.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-sm font-semibold text-ink-muted">
          {topic.completedCount}/{topic.requiredCount}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full transition-all ${
            topic.isComplete ? "bg-mint-500" : "bg-heal-gradient"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-4 space-y-2">
        {topic.modules.map((mod) => {
          const p = progressByModule.get(mod.id);
          const done = p?.status === "completed";
          const started = p?.status === "in_progress";
          return (
            <li key={mod.id}>
              <Link
                href={`/modules/${mod.id}`}
                className="flex items-center gap-3 rounded-xl border border-surface-muted px-3 py-2.5 transition-colors hover:border-teal-300"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-mint-100 text-mint-700"
                      : "bg-surface-muted text-ink-soft"
                  }`}
                >
                  {done ? "✓" : "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {mod.title}
                  </p>
                  <span className="text-xs text-ink-muted">
                    {TYPE_LABEL[mod.type]}
                    {!mod.is_required && " · Optional"}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink-muted">
                  {done ? "Completed" : started ? "In progress" : "Start"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ModuleRow({
  mod,
  index,
  progress,
}: {
  mod: Module;
  index: number;
  progress?: Progress;
}) {
  const done = progress?.status === "completed";
  const started = progress?.status === "in_progress";
  return (
    <li>
      <Link
        href={`/modules/${mod.id}`}
        className="flex items-center gap-4 rounded-2xl border border-surface-muted bg-white p-4 shadow-card transition-colors hover:border-teal-300"
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
            done ? "bg-mint-100 text-mint-700" : "bg-surface-muted text-ink-soft"
          }`}
        >
          {done ? "✓" : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-teal-50 text-teal-700">
              {TYPE_LABEL[mod.type]}
            </span>
            {!mod.is_required && (
              <span className="badge bg-surface-muted text-ink-muted">
                Optional
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-semibold text-ink">{mod.title}</p>
          {mod.sdgs && mod.sdgs.length > 0 && (
            <div className="mt-2">
              <SdgChips sdgs={mod.sdgs} size="xs" />
            </div>
          )}
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-muted">
          {done ? "Completed" : started ? "In progress" : "Start"}
        </span>
      </Link>
    </li>
  );
}
