import Link from "next/link";
import { HealLogo } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Verify certificate" };

interface PublicCertificate {
  id: string;
  recipient_name: string;
  fellowship_title: string;
  issued_at: string;
  status: "valid" | "revoked";
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Public read: the certificate_verifications VIEW exposes only the safe,
  // public columns and is granted to anon. No login required.
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificate_verifications")
    .select("id, recipient_name, fellowship_title, issued_at, status")
    .eq("id", id)
    .maybeSingle();

  const cert = data as PublicCertificate | null;

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <HealLogo href="/" />
        <Link href="/verify" className="text-sm text-ink-muted hover:text-ink">
          Verify another
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8">
        {!cert ? (
          <NotFoundCard id={id} />
        ) : cert.status === "revoked" ? (
          <RevokedCard cert={cert} />
        ) : (
          <ValidCard cert={cert} />
        )}

        <p className="mt-6 text-center text-xs text-ink-muted">
          Verification reads directly from Heal&apos;s records. Certificate data
          is immutable once issued.
        </p>
      </main>
    </div>
  );
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "valid" | "revoked" | "unknown";
  children: React.ReactNode;
}) {
  const styles = {
    valid: "bg-mint-500 text-white",
    revoked: "bg-coral-600 text-white",
    unknown: "bg-ink text-white",
  }[tone];
  return (
    <div className={`flex items-center gap-3 rounded-t-3xl px-8 py-5 ${styles}`}>
      {children}
    </div>
  );
}

function ValidCard({ cert }: { cert: PublicCertificate }) {
  const issued = new Date(cert.issued_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="overflow-hidden rounded-3xl border border-surface-muted bg-white shadow-lift">
      <StatusBanner tone="valid">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-lg">
          ✓
        </span>
        <div>
          <p className="text-lg font-bold leading-tight">Verified certificate</p>
          <p className="text-sm text-white/80">This certificate is valid.</p>
        </div>
      </StatusBanner>
      <dl className="space-y-5 p-8">
        <Row label="Recipient" value={cert.recipient_name} big />
        <Row label="Program" value={cert.fellowship_title} />
        <Row label="Issued" value={issued} />
        <Row label="Certificate ID" value={cert.id} mono />
      </dl>
    </div>
  );
}

function RevokedCard({ cert }: { cert: PublicCertificate }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-surface-muted bg-white shadow-lift">
      <StatusBanner tone="revoked">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-lg">
          !
        </span>
        <div>
          <p className="text-lg font-bold leading-tight">Certificate revoked</p>
          <p className="text-sm text-white/80">
            This certificate is no longer valid.
          </p>
        </div>
      </StatusBanner>
      <dl className="space-y-5 p-8">
        <Row label="Recipient" value={cert.recipient_name} big />
        <Row label="Program" value={cert.fellowship_title} />
        <Row label="Certificate ID" value={cert.id} mono />
      </dl>
    </div>
  );
}

function NotFoundCard({ id }: { id: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-surface-muted bg-white shadow-lift">
      <StatusBanner tone="unknown">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-lg">
          ?
        </span>
        <div>
          <p className="text-lg font-bold leading-tight">No matching certificate</p>
          <p className="text-sm text-white/80">
            We couldn&apos;t find a certificate with this ID.
          </p>
        </div>
      </StatusBanner>
      <div className="p-8">
        <p className="text-sm text-ink-soft">
          Double-check the ID or scan the QR code on the certificate again.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-ink-muted">{id}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  big,
  mono,
}: {
  label: string;
  value: string;
  big?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-ink ${big ? "text-2xl font-bold" : ""} ${
          mono ? "break-all font-mono text-sm text-ink-soft" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
