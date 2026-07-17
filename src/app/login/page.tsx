import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HealLogo } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  // Already signed in? Skip the form.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden bg-heal-gradient p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <HealLogo href="/" className="[&_span]:text-white" />
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
            Learn deeply. Earn a certificate the world can verify.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Sign in to continue your internship, track your progress, and
            download your verifiable certificate.
          </p>
        </div>
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} Heal Social Foundation
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <HealLogo href="/" />
          </div>
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-ink-soft">
            Use a magic link or your Google account.
          </p>

          <Suspense
            fallback={<div className="mt-6 h-40 animate-pulse rounded-xl bg-surface-muted" />}
          >
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-ink-muted">
            New here? Signing in creates your account automatically and unlocks
            your internships.
          </p>
        </div>
      </div>
    </div>
  );
}
