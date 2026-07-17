import Link from "next/link";
import { HealLogo } from "@/components/brand";
import { GuestButton } from "@/components/guest-button";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh bg-surface">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <HealLogo />
        <nav className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/login" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
          <div className="flex flex-col justify-center">
            <span className="badge w-fit bg-mint-100 text-mint-800">
              Impact Simulations · Case Studies · UN SDGs
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              The Digital Impact Internship for{" "}
              <span className="bg-heal-gradient bg-clip-text text-transparent">
                real-world change
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Work through impact simulations, case studies, and real-world
              applications mapped to the UN Sustainable Development Goals. Finish
              and earn an Impact Certification anyone can independently verify.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary px-5 py-3 text-base">
                Start your internship
              </Link>
              <GuestButton
                className="btn-ghost px-5 py-3 text-base"
                label="Explore as guest"
              />
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Sign in with email or Google to begin. A verifiable certificate is
              waiting at the finish line.
            </p>
          </div>

          {/* Decorative brand panel */}
          <div className="relative flex items-center justify-center">
            <div className="aspect-[4/5] w-full max-w-sm rounded-3xl bg-heal-gradient p-8 shadow-lift">
              <div className="flex h-full flex-col justify-between text-white">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-white/70">
                    Impact Certification
                  </p>
                  <p className="mt-6 font-display text-2xl font-bold">
                    Applied AI Impact Internship
                  </p>
                  <p className="mt-1 text-white/80">Heal Social Foundation</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-white/80">Verify at</p>
                  <p className="font-mono text-sm">/verify/&lt;id&gt;</p>
                  <p className="mt-3 text-xs text-white/70">
                    Independently checkable · immutable · QR-signed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-muted bg-surface-subtle">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-muted sm:flex-row">
          <HealLogo href={null} />
          <p>© {new Date().getFullYear()} Heal Social Foundation</p>
          <div className="flex gap-4">
            <Link href="/verify" className="hover:text-ink">
              Verify a certificate
            </Link>
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
