import Link from "next/link";
import { HealLogo } from "@/components/brand";
import { GuestButton } from "@/components/guest-button";
import { HeroMontage } from "@/components/hero-montage";
import { TrustFooter } from "@/components/trust-footer";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh bg-surface">
      {/* Header. Transparent and layered over the montage, so the imagery runs
          to the top of the window the way the reference does. */}
      <header className="absolute inset-x-0 top-0 z-30">
        {/* A short scrim: the montage runs under the bar, and white type needs
            something to sit on when a pale panel scrolls beneath it. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <HealLogo onDark />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/10 sm:inline-flex"
            >
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-mint-100"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-mint-100"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <HeroMontage />

      {/* Features */}
      <section id="topics" className="border-t border-surface-muted bg-surface-subtle">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Immersive modules",
              body: "Hands-on simulations, case studies, and assessments — hosted natively and rendered securely in your browser.",
              accent: "text-teal-600",
            },
            {
              title: "Server-verified progress",
              body: "Completion is validated on the server, never trusted blindly from the browser. Your certificate means something.",
              accent: "text-brandblue-600",
            },
            {
              title: "Publicly verifiable",
              body: "Every certificate carries a QR code linking to a public verification page — no login required to check it.",
              accent: "text-coral-500",
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className={`text-lg font-bold ${f.accent}`}>{f.title}</h3>
              <p className="mt-2 text-ink-soft">{f.body}</p>
            </div>
          ))}
          <div className="md:col-span-3 flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login" className="btn-primary px-5 py-3 text-base">
              Become a Solutions Builder
            </Link>
            <GuestButton
              className="btn-ghost px-5 py-3 text-base"
              label="Explore as guest"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-muted sm:flex-row">
          <HealLogo href={null} />
          <p>© {new Date().getFullYear()} Heal Social Foundation</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/verify" className="hover:text-ink">
              Verify a certificate
            </Link>
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>
        <TrustFooter />
      </footer>
    </div>
  );
}
