import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { RedeemForm } from "./redeem-form";

export const metadata = { title: "Redeem a seat code" };

export default async function RedeemPage() {
  // Middleware already redirects anonymous users to /login?next=/redeem.
  await requireUser();
  const profile = await getProfile();

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto flex max-w-lg flex-col px-6 py-12">
        <div className="card">
          <span className="badge w-fit bg-gold-100 text-gold-800">
            Partner-sponsored access
          </span>
          <h1 className="mt-3 text-2xl font-extrabold">Redeem your seat code</h1>
          <p className="mt-1 text-ink-soft">
            Enter the code your partner organisation gave you to unlock your
            internship. There&apos;s no payment — your seat is already sponsored.
          </p>

          <div className="mt-6">
            <RedeemForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have a code?{" "}
          <Link href="/dashboard" className="font-semibold text-teal-600 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
