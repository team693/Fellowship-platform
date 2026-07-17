import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { createFellowship } from "../actions";
import type { Fellowship } from "@/lib/types";

export default async function AdminFellowshipsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fellowships")
    .select("*")
    .order("created_at", { ascending: false });
  const fellowships = (data as Fellowship[]) ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-2xl font-extrabold">Internships</h1>
        <p className="mt-1 text-ink-soft">Create internships and manage their modules.</p>

        <div className="mt-6 space-y-3">
          {fellowships.map((f) => (
            <Link
              key={f.id}
              href={`/admin/fellowships/${f.id}`}
              className="flex items-center gap-4 rounded-2xl border border-surface-muted bg-white p-4 shadow-card hover:border-teal-300"
            >
              <span
                className="h-10 w-10 shrink-0 rounded-xl"
                style={{ backgroundColor: f.cover_color ?? "#0f8b80" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{f.title}</p>
                <p className="truncate text-sm text-ink-muted">/{f.slug}</p>
              </div>
              {f.is_published ? (
                <span className="badge bg-mint-100 text-mint-800">Published</span>
              ) : (
                <span className="badge bg-surface-muted text-ink-muted">Draft</span>
              )}
            </Link>
          ))}
          {fellowships.length === 0 && (
            <div className="card text-center text-ink-muted">No internships yet.</div>
          )}
        </div>
      </div>

      <aside>
        <div className="card">
          <h2 className="text-lg font-bold">New internship</h2>
          <ActionForm action={createFellowship} submitLabel="Create" className="mt-4">
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="title">Title *</label>
                <input id="title" name="title" className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="slug">Slug *</label>
                <input id="slug" name="slug" className="input" placeholder="ai-governance" required />
              </div>
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={3} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="locale">Locale</label>
                  <select id="locale" name="locale" className="input">
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="cover_color">Cover color</label>
                  <input id="cover_color" name="cover_color" type="color" defaultValue="#0f8b80" className="input h-[42px] p-1" />
                </div>
              </div>
            </div>
          </ActionForm>
        </div>
      </aside>
    </div>
  );
}
