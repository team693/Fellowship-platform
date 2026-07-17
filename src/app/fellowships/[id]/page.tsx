import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Fellowship, Module, Progress } from "@/lib/types";

export const metadata = { title: "Internship" };

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
    // Not enrolled (e.g. an unpublished internship under open access).
    redirect("/dashboard");
  }

  const [{ data: moduleRows }, { data: progressRows }, { data: certRow }] =
    await Promise.all([
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
    ]);

  const modules = (moduleRows as Module[]) ?? [];
  const progress = (progressRows as Progress[]) ?? [];
  const certificate = certRow as Certificate | null;

  const progressByModule = new Map(progress.map((p) => [p.module_id, p]));
  const required = modules.filter((m) => m.is_required);
  const completedRequired = required.filter(
    (m) => progressByModule.get(m.id)?.status === "completed",
  ).length;
  const pct = required.length
    ? Math.round((completedRequired / required.length) * 100)
    : 0;
  const allDone = required.length > 0 && completedRequired === required.length;

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
          ← Dashboard
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{fellowship.title}</h1>
            {fellowship.description && (
              <p className="mt-2 max-w-2xl text-ink-soft">{fellowship.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">
              {completedRequired}/{required.length} required modules complete
            </span>
            <span className="font-semibold text-teal-700">{pct}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-heal-gradient transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          {allDone && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-mint-50 p-4">
              <span className="text-xl">🎉</span>
              <p className="flex-1 text-sm text-mint-800">
                You&apos;ve completed every required module.
              </p>
              {certificate ? (
                <Link href={`/certificates/${certificate.id}`} className="btn-primary">
                  View certificate
                </Link>
              ) : (
                <Link href={`/fellowships/${id}/complete`} className="btn-primary">
                  Claim your certificate
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Modules */}
        <ol className="mt-8 space-y-3">
          {modules.map((mod, i) => {
            const p = progressByModule.get(mod.id);
            const done = p?.status === "completed";
            const started = p?.status === "in_progress";
            return (
              <li key={mod.id}>
                <Link
                  href={`/modules/${mod.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-surface-muted bg-white p-4 shadow-card transition-colors hover:border-teal-300"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      done
                        ? "bg-mint-100 text-mint-700"
                        : "bg-surface-muted text-ink-soft"
                    }`}
                  >
                    {done ? "✓" : i + 1}
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
                  </div>
                  <span className="shrink-0 text-sm font-medium text-ink-muted">
                    {done ? "Completed" : started ? "In progress" : "Start"}
                  </span>
                </Link>
              </li>
            );
          })}
          {modules.length === 0 && (
            <li className="card text-center text-ink-muted">
              No modules have been added to this internship yet.
            </li>
          )}
        </ol>
      </main>
    </div>
  );
}
