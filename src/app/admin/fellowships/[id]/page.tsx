import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import {
  createModule,
  deleteModule,
  reorderModule,
  updateFellowship,
} from "../../actions";
import type { CompletionConfig, Fellowship, Module } from "@/lib/types";

export default async function AdminFellowshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fellowshipRow } = await supabase
    .from("fellowships")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const fellowship = fellowshipRow as Fellowship | null;
  if (!fellowship) notFound();

  const { data: moduleRows } = await supabase
    .from("modules")
    .select("*")
    .eq("fellowship_id", id)
    .order("order_index", { ascending: true });
  const modules = (moduleRows as Module[]) ?? [];

  return (
    <div>
      <Link href="/admin/fellowships" className="text-sm text-ink-muted hover:text-ink">
        ← Internships
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold">{fellowship.title}</h1>
      <p className="mt-1 text-ink-soft">
        <Link href={`/fellowships/${fellowship.id}`} className="text-teal-600 hover:underline">
          Preview
        </Link>{" "}
        · /{fellowship.slug}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Modules */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Modules ({modules.length})</h2>
          </div>

          <ol className="mt-3 space-y-3">
            {modules.map((mod, i) => {
              const config = (mod.completion_config ?? {}) as CompletionConfig;
              return (
                <li
                  key={mod.id}
                  className="rounded-2xl border border-surface-muted bg-white p-4 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge bg-teal-50 text-teal-700">{mod.type}</span>
                        <span className="badge bg-brandblue-50 text-brandblue-700">
                          {mod.completion_rule}
                        </span>
                        {!mod.is_required && (
                          <span className="badge bg-surface-muted text-ink-muted">optional</span>
                        )}
                      </div>
                      <p className="mt-1 font-semibold">{mod.title}</p>
                      <p className="font-mono text-xs text-ink-muted">
                        {mod.asset_path}
                        {mod.completion_rule === "engagement" && config.min_seconds != null
                          ? ` · ${config.min_seconds}s min`
                          : ""}
                        {mod.completion_rule === "reported" && config.pass_score != null
                          ? ` · pass ${config.pass_score}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ReorderButton moduleId={mod.id} fellowshipId={id} direction="up" disabled={i === 0} />
                      <ReorderButton moduleId={mod.id} fellowshipId={id} direction="down" disabled={i === modules.length - 1} />
                      <ActionForm
                        action={deleteModule}
                        submitLabel="✕"
                        variant="ghost"
                        confirm="Delete this module? This cannot be undone."
                        className="inline"
                      >
                        <input type="hidden" name="module_id" value={mod.id} />
                        <input type="hidden" name="fellowship_id" value={id} />
                      </ActionForm>
                    </div>
                  </div>
                </li>
              );
            })}
            {modules.length === 0 && (
              <li className="card text-center text-ink-muted">No modules yet. Add one →</li>
            )}
          </ol>

          {/* Add module */}
          <div className="card mt-6">
            <h3 className="font-bold">Add a module</h3>
            <ActionForm
              action={createModule}
              submitLabel="Add module"
              successMessage="Module added ✓"
              className="mt-4"
            >
              <input type="hidden" name="fellowship_id" value={id} />
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="m_title">Title *</label>
                  <input id="m_title" name="title" className="input" required />
                </div>
                <div>
                  <label className="label" htmlFor="m_description">Description</label>
                  <textarea id="m_description" name="description" rows={2} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="m_type">Type</label>
                    <select id="m_type" name="type" className="input">
                      <option value="explore">explore</option>
                      <option value="assessed">assessed</option>
                      <option value="case_study">case_study</option>
                      <option value="quiz">quiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="m_rule">Completion rule</label>
                    <select id="m_rule" name="completion_rule" className="input">
                      <option value="engagement">engagement</option>
                      <option value="reported">reported</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="m_asset">
                    Asset file (in public/simulations) *
                  </label>
                  <input
                    id="m_asset"
                    name="asset_path"
                    className="input font-mono"
                    placeholder="my-simulation.html"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="m_min">Min seconds (engagement)</label>
                    <input id="m_min" name="min_seconds" type="number" min={0} defaultValue={20} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="m_pass">Pass score (reported)</label>
                    <input id="m_pass" name="pass_score" type="number" min={0} max={100} defaultValue={70} className="input" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_required" defaultChecked /> Required for certificate
                </label>
              </div>
            </ActionForm>
          </div>
        </div>

        {/* Fellowship settings */}
        <aside>
          <div className="card">
            <h2 className="text-lg font-bold">Settings</h2>
            <ActionForm
              action={updateFellowship}
              submitLabel="Save"
              successMessage="Saved ✓"
              className="mt-4"
            >
              <input type="hidden" name="fellowship_id" value={id} />
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="f_title">Title</label>
                  <input id="f_title" name="title" className="input" defaultValue={fellowship.title} />
                </div>
                <div>
                  <label className="label" htmlFor="f_desc">Description</label>
                  <textarea id="f_desc" name="description" rows={3} className="input" defaultValue={fellowship.description ?? ""} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="f_locale">Locale</label>
                    <select id="f_locale" name="locale" className="input" defaultValue={fellowship.locale}>
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="f_color">Cover color</label>
                    <input id="f_color" name="cover_color" type="color" defaultValue={fellowship.cover_color ?? "#0f8b80"} className="input h-[42px] p-1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" defaultChecked={fellowship.is_published} />
                  Published (visible to enrolled students)
                </label>
              </div>
            </ActionForm>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReorderButton({
  moduleId,
  fellowshipId,
  direction,
  disabled,
}: {
  moduleId: string;
  fellowshipId: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted opacity-30">
        {direction === "up" ? "↑" : "↓"}
      </span>
    );
  }
  return (
    <form
      action={async (fd) => {
        "use server";
        await reorderModule(fd);
      }}
    >
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="fellowship_id" value={fellowshipId} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-subtle"
        aria-label={`Move ${direction}`}
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}
