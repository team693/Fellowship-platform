import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { Certificate } from "@/lib/types";

export const metadata = { title: "Your certificate" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: certRow } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const cert = certRow as Certificate | null;
  if (!cert) notFound();

  const verifyUrl = `${env.siteUrl()}/verify/${cert.id}`;
  const issued = new Date(cert.issued_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
          ← Dashboard
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl border border-surface-muted bg-white shadow-lift">
          <div className="bg-heal-gradient px-8 py-6 text-white">
            <p className="font-mono text-xs uppercase tracking-widest text-white/80">
              Certificate of Completion
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">{cert.recipient_name}</h1>
            <p className="mt-1 text-white/90">{cert.fellowship_title}</p>
          </div>

          <div className="grid gap-4 p-8 sm:grid-cols-2">
            <Field label="Issued">{issued}</Field>
            <Field label="Status">
              {cert.status === "valid" ? (
                <span className="badge bg-mint-100 text-mint-800">Valid</span>
              ) : (
                <span className="badge bg-coral-100 text-coral-700">Revoked</span>
              )}
            </Field>
            <Field label="Certificate ID">
              <span className="break-all font-mono text-sm">{cert.id}</span>
            </Field>
            <Field label="Verification">
              <Link href={`/verify/${cert.id}`} className="text-teal-600 hover:underline">
                {verifyUrl}
              </Link>
            </Field>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-surface-muted px-8 py-6">
            <a
              href={`/api/certificates/${cert.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              ⬇ Download PDF
            </a>
            <Link href={`/verify/${cert.id}`} className="btn-ghost">
              View public verification
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          This certificate is immutable once issued. Anyone can verify it at the
          link above — no login required.
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <div className="mt-1 text-ink">{children}</div>
    </div>
  );
}
