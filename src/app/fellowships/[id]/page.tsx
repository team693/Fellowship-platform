import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProgressRing } from "@/components/progress-ring";
import { SdgChips, SdgStrip } from "@/components/sdg-badges";
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

const TYPE_META: Record<
  Module["type"],
  { label: string; icon: string; tile: string }
> = {
  explore: { label: "Explore", icon: "🧭", tile: "bg-teal-50 text-teal-700" },
  assessed: {
    label: "Assessed",
    icon: "📊",
    tile: "bg-brandblue-50 text-brandblue-700",
  },
  case_study: {
    label: "Case study",
    icon: "📖",
    tile: "bg-gold-50 text-gold-900",
  },
  quiz: { label: "Quiz", icon: "🧠", tile: "bg-coral-50 text-coral-700" },
};

/* Accent rail per topic card, rotating through the brand palette. */
const TOPIC_ACCENTS = ["#0f8b80", "#3163fb", "#e6a92f", "#22ad6c"];

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

      {/* Header band: a soft brand wash instead of a floating title in white
          space, with the four-week shape spelled out as steps. */}
      <div className="border-b border-surface-muted bg-gradient-to-b from-teal-50/70 via-surface-subtle to-surface">
        <div className="mx-auto max-w-6xl px-6 pb-6 pt-5">
          <nav className="text-sm text-ink-muted">
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <span className="mx-2 text-surface-muted">/</span>
            <span className="text-ink-soft">{fellowship.title}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0 max-w-2xl">
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {fellowship.title}
              </h1>
              {fellowship.description && (
                <p className="mt-2 text-ink-soft">{fellowship.description}</p>
              )}
              {allSdgs.length > 0 && (
                <div className="mt-4">
                  <SdgStrip allSdgs={allSdgs} coveredSdgs={coveredSdgs} />
                </div>
              )}
            </div>
            {/* The programme shape, as steps rather than a sentence. */}
            <ol className="flex items-center gap-2 pb-1 text-xs font-semibold">
              {[
                ["1", "Core", structure.coreComplete],
                ["2–4", "3 topics", structure.topicsCompleted >= structure.topicsRequired],
                ["4", "Capstone", false],
              ].map(([wk, label, done], i) => (
                <li key={label as string} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="h-px w-4 bg-ink-muted/30" />}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                      done
                        ? "border-mint-300 bg-mint-50 text-mint-800"
                        : "border-surface-muted bg-white text-ink-soft"
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                      Wk {wk}
                    </span>
                    {label}
                    {done && " ✓"}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
        {/* ---------------- left: the work ---------------- */}
        <div className="min-w-0 flex-1">

        {/* ---- Week 1: compulsory core ---------------------------------- */}
        <section>
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
        <section className="mt-8">
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

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {structure.topics.map((topic, ti) => (
              <TopicCard
                key={topic.route.id}
                topic={topic}
                accent={TOPIC_ACCENTS[ti % TOPIC_ACCENTS.length]}
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
        <section className="mt-8">
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
        </div>

        {/* ---------------- right: the journey ---------------- */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="card !p-5">
              <div className="flex items-center gap-4">
                <div className="relative grid shrink-0 place-items-center">
                  <ProgressRing percent={structure.percent} size={72} stroke={7} />
                  <span className="absolute text-base font-extrabold text-teal-700">
                    {structure.percent}%
                  </span>
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold">
                    Your journey
                  </p>
                  <p className="text-sm text-ink-muted">
                    {structure.isComplete
                      ? "Complete. Well done."
                      : structure.percent === 0
                        ? "Begins with Week 1."
                        : "Keep the streak going."}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-soft">
                      Week 1 · Core
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {structure.coreCompleted}/{structure.coreRequired}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="progress-fill h-full rounded-full bg-teal-600"
                      style={{
                        width: `${
                          structure.coreRequired
                            ? Math.round(
                                (structure.coreCompleted /
                                  structure.coreRequired) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-soft">
                      Weeks 2&ndash;4 · Topics
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {structure.topicsCompleted}/{structure.topicsRequired}
                    </span>
                  </div>
                  {/* One segment per required topic, filled by the learner's
                      best topics — the bar literally has the programme's shape. */}
                  <div className="mt-1.5 flex gap-1">
                    {[...structure.topics]
                      .map((t) => t.fraction)
                      .sort((a, b) => b - a)
                      .slice(0, structure.topicsRequired)
                      .concat(
                        Array(
                          Math.max(
                            0,
                            structure.topicsRequired - structure.topics.length,
                          ),
                        ).fill(0),
                      )
                      .map((f, i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
                        >
                          <div
                            className="progress-fill h-full rounded-full bg-heal-gradient"
                            style={{ width: `${Math.round(f * 100)}%` }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-surface-muted pt-4">
                {structure.isComplete ? (
                  certificate ? (
                    <Link
                      href={`/certificates/${certificate.id}`}
                      className="btn-primary w-full"
                    >
                      View your certificate
                    </Link>
                  ) : (
                    <Link
                      href={`/fellowships/${id}/complete`}
                      className="btn-primary w-full"
                    >
                      Claim your certificate
                    </Link>
                  )
                ) : (
                  <p className="text-xs leading-relaxed text-ink-muted">
                    Finish the core and any {structure.topicsRequired} topics to
                    earn your <strong>Impact Certification</strong> — publicly
                    verifiable, QR-signed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TopicCard({
  topic,
  accent,
  progressByModule,
  isPrimary,
}: {
  topic: TopicProgress<Module, Route>;
  accent: string;
  progressByModule: Map<string, Progress>;
  isPrimary: boolean;
}) {
  const pct = Math.round(topic.fraction * 100);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 pl-6 shadow-card ${
        topic.isComplete ? "border-mint-300" : "border-surface-muted"
      }`}
    >
      {/* accent rail: each topic gets its own colour identity */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: topic.isComplete ? "#22ad6c" : accent }}
      />
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
                className="group flex items-center gap-3 rounded-xl border border-surface-muted px-3 py-2.5 transition-colors hover:border-teal-300 hover:bg-teal-50/30"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${
                    done ? "bg-mint-100" : TYPE_META[mod.type].tile
                  }`}
                >
                  {done ? "✓" : TYPE_META[mod.type].icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {mod.title}
                  </p>
                  <span className="text-xs text-ink-muted">
                    {TYPE_META[mod.type].label}
                    {!mod.is_required && " · Optional"}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    done
                      ? "text-mint-700"
                      : started
                        ? "text-gold-700"
                        : "text-teal-700 transition-transform duration-200 group-hover:translate-x-0.5"
                  }`}
                >
                  {done ? "Done ✓" : started ? "In progress" : "Start →"}
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
  const meta = TYPE_META[mod.type];
  return (
    <li>
      <Link
        href={`/modules/${mod.id}`}
        className="card-interactive group flex items-center gap-4 !p-4"
      >
        <span
          className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ${
            done ? "bg-mint-100" : meta.tile
          }`}
        >
          {done ? "✓" : meta.icon}
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-surface-muted bg-white text-[10px] font-bold text-ink-soft">
            {index + 1}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">
              {meta.label}
            </span>
            {!mod.is_required && (
              <span className="badge bg-surface-muted text-ink-muted">
                Optional
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate font-semibold text-ink">{mod.title}</p>
          {mod.sdgs && mod.sdgs.length > 0 && (
            <div className="mt-1.5">
              <SdgChips sdgs={mod.sdgs} size="xs" />
            </div>
          )}
        </div>
        <span
          className={`shrink-0 text-sm font-semibold ${
            done
              ? "text-mint-700"
              : started
                ? "text-gold-700"
                : "text-teal-700 transition-transform duration-200 group-hover:translate-x-0.5"
          }`}
        >
          {done ? "Done ✓" : started ? "Continue →" : "Start →"}
        </span>
      </Link>
    </li>
  );
}
