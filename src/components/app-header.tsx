import Link from "next/link";
import { HealLogo } from "@/components/brand";
import type { Profile } from "@/lib/types";

/** Header for signed-in app pages. */
export function AppHeader({
  profile,
  isGuest = false,
}: {
  profile: Profile | null;
  isGuest?: boolean;
}) {
  const isAdmin = profile?.role === "admin";
  return (
    <header className="border-b border-surface-muted bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <HealLogo href="/dashboard" />
          {isGuest && (
            <span className="badge bg-gold-100 text-gold-800">Guest</span>
          )}
        </div>
        <nav className="flex items-center gap-1 text-sm">
          {isGuest && (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 font-semibold text-teal-700 hover:bg-teal-50"
            >
              Sign in to save
            </Link>
          )}
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 font-medium text-ink-soft hover:bg-surface-subtle hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="rounded-lg px-3 py-2 font-medium text-ink-soft hover:bg-surface-subtle hover:text-ink"
          >
            Profile
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 font-medium text-brandblue-700 hover:bg-brandblue-50"
            >
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 font-medium text-ink-soft hover:bg-surface-subtle hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
