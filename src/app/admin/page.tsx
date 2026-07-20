import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const count = async (table: string) => {
    const { count: c } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    return c ?? 0;
  };

  const [partners, fellowships, codesTotal, certificates, enrollments] =
    await Promise.all([
      count("partners"),
      count("fellowships"),
      count("enrollment_codes"),
      count("certificates"),
      count("enrollments"),
    ]);

  const { count: redeemedCount } = await supabase
    .from("enrollment_codes")
    .select("*", { count: "exact", head: true })
    .eq("status", "redeemed");
  const codesRedeemed = redeemedCount ?? 0;

  const stats = [
    { label: "Partners", value: partners, href: "/admin/partners", accent: "text-teal-600" },
    { label: "Programs", value: fellowships, href: "/admin/fellowships", accent: "text-brandblue-600" },
    { label: "Enrollments", value: enrollments, href: "/admin/partners", accent: "text-mint-600" },
    { label: "Codes redeemed", value: `${codesRedeemed}/${codesTotal}`, href: "/admin/partners", accent: "text-gold-600" },
    { label: "Certificates issued", value: certificates, href: "/admin/fellowships", accent: "text-coral-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Admin overview</h1>
      <p className="mt-1 text-ink-soft">Manage partners, seat codes, content, and spotlights.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card transition-shadow hover:shadow-lift">
            <p className="text-sm font-medium text-ink-muted">{s.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${s.accent}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/partners" className="card hover:shadow-lift">
          <h2 className="font-bold">Partners &amp; seat codes →</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Add partners, generate code batches, and view completions per partner.
          </p>
        </Link>
        <Link href="/admin/fellowships" className="card hover:shadow-lift">
          <h2 className="font-bold">Programs &amp; modules →</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Create programs, add/reorder modules, and publish content.
          </p>
        </Link>
      </div>
    </div>
  );
}
