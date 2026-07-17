import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { requireUser, getProfile } from "@/lib/auth";
import { issueCertificateIfEligible } from "@/lib/certificates";

/**
 * Claim page. Re-runs server-side eligibility (all required modules complete)
 * and, if eligible, issues the certificate and redirects to it. This is a
 * fallback to the automatic issuance that happens on final-module completion.
 */
export default async function CompleteFellowshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const profile = await getProfile();

  const result = await issueCertificateIfEligible(user.id, id);
  if (result.issued && result.certificateId) {
    redirect(`/certificates/${result.certificateId}`);
  }

  const messages: Record<string, string> = {
    not_enrolled: "You're not enrolled in this internship yet.",
    incomplete:
      "You haven't completed all the required modules yet. Finish them to earn your certificate.",
    no_required_modules: "This internship has no required modules configured.",
  };

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="card text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted text-2xl">
            🎓
          </div>
          <h1 className="mt-4 text-xl font-bold">Not quite there yet</h1>
          <p className="mt-2 text-ink-soft">
            {messages[result.reason ?? ""] ??
              "We couldn't issue your certificate yet."}
          </p>
          <Link href={`/fellowships/${id}`} className="btn-primary mt-6">
            Back to internship
          </Link>
        </div>
      </main>
    </div>
  );
}
