import Link from "next/link";
import { HealLogo } from "@/components/brand";
import { TrustFooter } from "@/components/trust-footer";

export const metadata = { title: "Pricing" };

const METHODS = ["JazzCash", "Easypaisa", "Raast / Bank Transfer"];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <HealLogo />
        <Link href="/login" className="btn-ghost">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <span className="badge w-fit bg-mint-100 text-mint-800">IESP pricing</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight">
          One price. No hidden costs.
        </h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          IESP is a paid program — a standing price, not a limited-time
          discount.
        </p>

        <div className="card mt-8 max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Standard tuition
          </p>
          <p className="mt-2 font-display text-5xl font-extrabold text-ink">
            PKR 2,000
          </p>
          <p className="mt-1 text-sm text-ink-muted">One-time · per Solutions Builder</p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
            <li>• Full access to your chosen route &amp; lens content</li>
            <li>• The compulsory core curriculum (AI literacy, ethics, Karachi as a living lab)</li>
            <li>• A verifiable Impact Certification on completion</li>
            <li>• Your capstone artifact, published to your portfolio gallery</li>
          </ul>
          <Link href="/login" className="btn-primary mt-6 w-full justify-center py-3">
            Start your program
          </Link>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Payment methods
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {METHODS.map((m) => (
              <span
                key={m}
                className="rounded-xl border border-surface-muted bg-surface-subtle px-4 py-2.5 text-sm font-semibold text-ink-soft"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">
            No card-only checkout. Online payment is being finalized — for
            now, sign in to start your program at no cost while billing is
            wired up.
          </p>
        </div>
      </main>

      <TrustFooter />
    </div>
  );
}
