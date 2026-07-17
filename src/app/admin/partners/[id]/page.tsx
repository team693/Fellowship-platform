import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { generateCodes, revokeCode, updatePartnerSeats } from "../../actions";
import type { EnrollmentCode, Fellowship, Partner, Profile } from "@/lib/types";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const partner = partnerRow as Partner | null;
  if (!partner) notFound();

  const [{ data: fellowshipRows }, { data: codeRows }] = await Promise.all([
    supabase.from("fellowships").select("*").order("title"),
    supabase
      .from("enrollment_codes")
      .select("*")
      .eq("partner_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const fellowships = (fellowshipRows as Fellowship[]) ?? [];
  const codes = (codeRows as EnrollmentCode[]) ?? [];
  const fellowshipById = new Map(fellowships.map((f) => [f.id, f]));

  // Resolve redeemer identities + completion state.
  const redeemedCodes = codes.filter((c) => c.status === "redeemed" && c.redeemed_by);
  const userIds = [...new Set(redeemedCodes.map((c) => c.redeemed_by!))];
  const fellowshipIds = [...new Set(redeemedCodes.map((c) => c.fellowship_id))];

  const profilesById = new Map<string, Profile>();
  const certKeys = new Set<string>();
  if (userIds.length) {
    const [{ data: profs }, { data: certs }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", userIds),
      supabase
        .from("certificates")
        .select("user_id, fellowship_id")
        .in("user_id", userIds)
        .in("fellowship_id", fellowshipIds.length ? fellowshipIds : ["_"]),
    ]);
    for (const p of (profs as Profile[]) ?? []) profilesById.set(p.id, p);
    for (const c of certs ?? []) certKeys.add(`${c.user_id}:${c.fellowship_id}`);
  }

  const completions = redeemedCodes.filter((c) =>
    certKeys.has(`${c.redeemed_by}:${c.fellowship_id}`),
  ).length;

  const unused = codes.filter((c) => c.status === "unused").length;
  const redeemed = redeemedCodes.length;

  return (
    <div>
      <Link href="/admin/partners" className="text-sm text-ink-muted hover:text-ink">
        ← Partners
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{partner.name}</h1>
          <p className="mt-1 text-ink-soft">
            {partner.contact_name ?? ""} {partner.contact_email ? `· ${partner.contact_email}` : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Seats" value={`${partner.seats_used}/${partner.seats_purchased}`} />
        <Stat label="Codes redeemed" value={`${redeemed}/${codes.length}`} />
        <Stat label="Unused codes" value={unused} />
        <Stat label="Completions" value={completions} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Codes table */}
        <div>
          <h2 className="text-lg font-bold">Seat codes</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle text-left text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Internship</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Redeemed by</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const prof = c.redeemed_by ? profilesById.get(c.redeemed_by) : null;
                  const completed =
                    c.redeemed_by && certKeys.has(`${c.redeemed_by}:${c.fellowship_id}`);
                  return (
                    <tr key={c.id} className="border-t border-surface-muted">
                      <td className="px-4 py-3 font-mono">{c.code}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {fellowshipById.get(c.fellowship_id)?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} completed={!!completed} />
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {prof ? prof.full_name ?? prof.email : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === "unused" && (
                          <ActionForm
                            action={revokeCode}
                            submitLabel="Revoke"
                            variant="ghost"
                            confirm="Revoke this unused code?"
                            className="inline"
                          >
                            <input type="hidden" name="code_id" value={c.id} />
                            <input type="hidden" name="partner_id" value={partner.id} />
                          </ActionForm>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      No codes generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: generate + seats */}
        <aside className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold">Generate codes</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Create a batch of unused seat codes for an internship.
            </p>
            <ActionForm
              action={generateCodes}
              submitLabel="Generate"
              successMessage="Codes generated ✓"
              className="mt-4"
            >
              <input type="hidden" name="partner_id" value={partner.id} />
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="fellowship_id">Internship</label>
                  <select id="fellowship_id" name="fellowship_id" className="input" required>
                    <option value="">Choose…</option>
                    {fellowships.map((f) => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="count">How many</label>
                  <input id="count" name="count" type="number" min={1} max={500} defaultValue={10} className="input" />
                </div>
              </div>
            </ActionForm>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold">Seat allowance</h2>
            <ActionForm
              action={updatePartnerSeats}
              submitLabel="Update seats"
              successMessage="Saved ✓"
              variant="ghost"
              className="mt-4"
            >
              <input type="hidden" name="partner_id" value={partner.id} />
              <label className="label" htmlFor="seats_purchased">Seats purchased</label>
              <input
                id="seats_purchased"
                name="seats_purchased"
                type="number"
                min={0}
                defaultValue={partner.seats_purchased}
                className="input"
              />
            </ActionForm>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-surface-muted bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({ status, completed }: { status: string; completed: boolean }) {
  if (status === "redeemed") {
    return completed ? (
      <span className="badge bg-mint-100 text-mint-800">Completed</span>
    ) : (
      <span className="badge bg-teal-50 text-teal-700">Redeemed</span>
    );
  }
  if (status === "revoked") {
    return <span className="badge bg-coral-100 text-coral-700">Revoked</span>;
  }
  return <span className="badge bg-surface-muted text-ink-muted">Unused</span>;
}
