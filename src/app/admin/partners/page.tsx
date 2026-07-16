import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { createPartner } from "../actions";
import type { Partner } from "@/lib/types";

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });
  const partners = (data as Partner[]) ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-2xl font-extrabold">Partners</h1>
        <p className="mt-1 text-ink-soft">Sponsoring organisations and their seat allowances.</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle text-left text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Seats</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-t border-surface-muted hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link href={`/admin/partners/${p.id}`} className="font-semibold text-teal-700 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono">
                      {p.seats_used}/{p.seats_purchased}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.contact_email ?? p.contact_name ?? "—"}
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                    No partners yet. Add your first one →
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside>
        <div className="card">
          <h2 className="text-lg font-bold">Add a partner</h2>
          <ActionForm action={createPartner} submitLabel="Create partner" className="mt-4">
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="name">Name *</label>
                <input id="name" name="name" className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="seats_purchased">Seats purchased</label>
                <input id="seats_purchased" name="seats_purchased" type="number" min={0} defaultValue={0} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="contact_name">Contact name</label>
                <input id="contact_name" name="contact_name" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="contact_email">Contact email</label>
                <input id="contact_email" name="contact_email" type="email" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" rows={2} className="input" />
              </div>
            </div>
          </ActionForm>
        </div>
      </aside>
    </div>
  );
}
