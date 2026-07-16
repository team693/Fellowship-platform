import { redirect } from "next/navigation";
import Link from "next/link";
import { HealLogo } from "@/components/brand";

export const metadata = { title: "Verify a certificate" };

async function lookup(formData: FormData) {
  "use server";
  const raw = String(formData.get("id") ?? "").trim();
  // Accept a pasted full verify URL or a bare id.
  const match = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const id = match ? match[0] : raw;
  if (id) redirect(`/verify/${encodeURIComponent(id)}`);
}

export default function VerifyIndexPage() {
  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <HealLogo href="/" />
        <Link href="/" className="text-sm text-ink-muted hover:text-ink">
          Home
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="card">
          <h1 className="text-2xl font-extrabold">Verify a certificate</h1>
          <p className="mt-1 text-ink-soft">
            Paste a certificate ID (or the full verification link) to check its
            authenticity. No account needed.
          </p>
          <form action={lookup} className="mt-6 space-y-3">
            <input
              name="id"
              className="input font-mono"
              placeholder="e.g. 3f1c…-…-…  or  /verify/<id>"
              aria-label="Certificate ID"
              required
            />
            <button type="submit" className="btn-primary w-full py-3">
              Verify
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
