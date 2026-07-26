import { requireAdmin } from "@/lib/auth";
import { getProgramStructure } from "@/lib/program";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Certificate,
  Enrollment,
  Fellowship,
  Lens,
  Module,
  Profile,
  Progress,
  Route,
} from "@/lib/types";

export const metadata = { title: "Cohort progress" };

/**
 * Read-only cohort monitoring: who is where in the program. Deliberately has
 * no reminder/notification machinery — for cohort 1 (~30 learners) nudging
 * happens over WhatsApp, and this table is what tells us who to nudge and,
 * more usefully, where people stall.
 *
 * Uses the service-role client so one query covers every learner. The page is
 * admin-gated twice: by the admin layout, and by requireAdmin() below.
 */
export default async function CohortPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    { data: fellowshipRows },
    { data: profileRows },
    { data: enrollmentRows },
    { data: moduleRows },
    { data: progressRows },
    { data: certRows },
    { data: routeRows },
    { data: lensRows },
  ] = await Promise.all([
    admin.from("fellowships").select("*").eq("is_published", true),
    admin.from("profiles").select("*"),
    admin.from("enrollments").select("*"),
    admin.from("modules").select("*"),
    admin.from("progress").select("*"),
    admin.from("certificates").select("*"),
    admin.from("routes").select("*").eq("is_active", true),
    admin.from("lenses").select("*").eq("is_active", true),
  ]);

  const fellowships = (fellowshipRows as Fellowship[]) ?? [];
  const profiles = (profileRows as Profile[]) ?? [];
  const enrollments = (enrollmentRows as Enrollment[]) ?? [];
  const modules = (moduleRows as Module[]) ?? [];
  const progress = (progressRows as Progress[]) ?? [];
  const certificates = (certRows as Certificate[]) ?? [];
  const routes = (routeRows as Route[]) ?? [];
  const lenses = (lensRows as Lens[]) ?? [];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const lensById = new Map(lenses.map((l) => [l.id, l]));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Cohort progress</h1>
      <p className="mt-1 text-ink-soft">
        Where every learner is. Week 1 core, then any {""}
        {routes.length >= 3 ? 3 : routes.length} topics.
      </p>

      {fellowships.length === 0 && (
        <div className="card mt-6 text-center text-ink-muted">
          No published programs yet.
        </div>
      )}

      {fellowships.map((fellowship) => {
        const fellowshipModules = modules.filter(
          (m) => m.fellowship_id === fellowship.id,
        );
        const learnerIds = enrollments
          .filter((e) => e.fellowship_id === fellowship.id)
          .map((e) => e.user_id);

        const rows = learnerIds
          .map((userId) => {
            const profile = profileById.get(userId);
            const userProgress = progress.filter(
              (p) => p.user_id === userId && p.fellowship_id === fellowship.id,
            );
            const structure = getProgramStructure(
              fellowshipModules,
              userProgress,
              routes,
            );
            const certificate = certificates.find(
              (c) => c.user_id === userId && c.fellowship_id === fellowship.id,
            );
            const lastActive = userProgress.reduce<string | null>(
              (latest, p) =>
                !latest || p.updated_at > latest ? p.updated_at : latest,
              null,
            );
            return { userId, profile, structure, certificate, lastActive };
          })
          // Furthest along first — the people who need chasing sink to the
          // bottom, which is where you want to look.
          .sort((a, b) => b.structure.percent - a.structure.percent);

        const started = rows.filter((r) => r.lastActive).length;
        const coreDone = rows.filter(
          (r) => r.structure.coreRequired > 0 && r.structure.coreComplete,
        ).length;
        const finished = rows.filter((r) => r.structure.isComplete).length;
        const certified = rows.filter((r) => r.certificate).length;

        return (
          <section key={fellowship.id} className="mt-8">
            <h2 className="text-lg font-bold">{fellowship.title}</h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Enrolled" value={rows.length} />
              <Stat label="Started" value={started} />
              <Stat label="Core complete" value={coreDone} />
              <Stat label="Program complete" value={finished} />
              <Stat label="Certificates" value={certified} />
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-muted bg-white shadow-card">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="border-b border-surface-muted bg-surface-subtle text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Learner</th>
                    <th className="px-4 py-3 font-semibold">Lens</th>
                    <th className="px-4 py-3 font-semibold">Core</th>
                    <th className="px-4 py-3 font-semibold">Topics</th>
                    <th className="px-4 py-3 font-semibold">Progress</th>
                    <th className="px-4 py-3 font-semibold">Certificate</th>
                    <th className="px-4 py-3 font-semibold">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const lens = row.profile?.lens_id
                      ? lensById.get(row.profile.lens_id)
                      : null;
                    const primary = row.profile?.route_id
                      ? routeById.get(row.profile.route_id)
                      : null;
                    return (
                      <tr
                        key={row.userId}
                        className="border-b border-surface-muted last:border-0"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">
                            {row.profile?.full_name?.trim() || "—"}
                            {row.profile?.role === "admin" && (
                              <span className="ml-2 badge bg-surface-muted text-ink-muted">
                                admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {row.profile?.email ?? row.userId}
                          </p>
                          {primary && (
                            <p className="mt-0.5 text-xs text-teal-700">
                              Capstone: {primary.title}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-soft">
                          {lens?.title ?? (
                            <span className="text-ink-muted">Not chosen</span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-ink-soft">
                          {row.structure.coreCompleted}/
                          {row.structure.coreRequired}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold tabular-nums text-ink">
                            {row.structure.topicsCompleted}/
                            {row.structure.topicsRequired}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {row.structure.topics
                              .filter((t) => t.isStarted)
                              .map((t) => (
                                <span
                                  key={t.route.id}
                                  className={`badge ${
                                    t.isComplete
                                      ? "bg-mint-100 text-mint-800"
                                      : "bg-gold-50 text-gold-900"
                                  }`}
                                >
                                  {t.route.title}
                                  {!t.isComplete &&
                                    ` ${t.completedCount}/${t.requiredCount}`}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-muted">
                              <div
                                className="h-full rounded-full bg-heal-gradient"
                                style={{ width: `${row.structure.percent}%` }}
                              />
                            </div>
                            <span className="tabular-nums text-xs font-semibold text-ink-soft">
                              {row.structure.percent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.certificate ? (
                            <span className="badge bg-mint-100 text-mint-800">
                              Issued
                            </span>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted">
                          {row.lastActive
                            ? new Date(row.lastActive).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short" },
                              )
                            : "Never"}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-ink-muted"
                      >
                        Nobody is enrolled in this program yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-surface-muted bg-white p-4 shadow-card">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
