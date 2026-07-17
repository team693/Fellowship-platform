"use client";

import { useState, useTransition } from "react";
import {
  saveSpotlightDetails,
  uploadSpotlightPhoto,
  deleteSpotlightPhoto,
  grantSpotlightConsent,
  withdrawSpotlightConsent,
} from "./spotlight-actions";
import { SPOTLIGHT_CONSENT_SCOPE, type SpotlightProfile } from "@/lib/types";

export function SpotlightSection({
  initial,
  initialPhotoUrl,
  fallbackName,
}: {
  initial: SpotlightProfile | null;
  initialPhotoUrl: string | null;
  fallbackName: string | null;
}) {
  const status = initial?.consent_status ?? "none";

  return (
    <section className="card mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Participant spotlight</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Optional. Let Heal feature you as a digital internship participant.
            This has no effect on your internship or certificate, and you can
            withdraw anytime.
          </p>
        </div>
        <ConsentPill status={status} />
      </div>

      <DetailsForm initial={initial} />

      <PhotoBlock initialPhotoUrl={initialPhotoUrl} hasPhoto={!!initial?.photo_path} />

      <ConsentBlock
        status={status}
        initial={initial}
        fallbackName={fallbackName}
        photoUrl={initialPhotoUrl}
      />
    </section>
  );
}

function ConsentPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    granted: "bg-mint-100 text-mint-800",
    withdrawn: "bg-surface-muted text-ink-muted",
    none: "bg-gold-100 text-gold-800",
  };
  const label: Record<string, string> = {
    granted: "Consent granted",
    withdrawn: "Consent withdrawn",
    none: "Not opted in",
  };
  return <span className={`badge ${map[status]}`}>{label[status]}</span>;
}

function useAction() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const run = (fn: () => Promise<{ ok: boolean; error?: string } | void>) => {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await fn();
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
      else setOk(true);
    });
  };
  return { isPending, error, ok, run };
}

function DetailsForm({ initial }: { initial: SpotlightProfile | null }) {
  const { isPending, error, ok, run } = useAction();
  return (
    <form
      action={(fd) => run(() => saveSpotlightDetails(fd))}
      className="mt-6 border-t border-surface-muted pt-6"
    >
      <h3 className="font-semibold text-ink">Your details</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field name="display_name" label="Display name" defaultValue={initial?.display_name} />
        <Field name="headline" label="Role / headline" defaultValue={initial?.headline} placeholder="e.g. Policy Fellow" />
        <Field name="city" label="City" defaultValue={initial?.city} />
        <Field name="country" label="Country" defaultValue={initial?.country} />
      </div>
      <div className="mt-3">
        <label className="label" htmlFor="short_bio">Short bio</label>
        <textarea id="short_bio" name="short_bio" rows={2} className="input" defaultValue={initial?.short_bio ?? ""} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="working_on">What you&apos;re working on</label>
          <textarea id="working_on" name="working_on" rows={2} className="input" defaultValue={initial?.working_on ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="quote">A short quote</label>
          <textarea id="quote" name="quote" rows={2} className="input" defaultValue={initial?.quote ?? ""} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className="btn-ghost" disabled={isPending}>
          {isPending ? "Saving…" : "Save details"}
        </button>
        {ok && <span className="text-sm text-mint-700">Saved ✓</span>}
        {error && <span className="text-sm text-coral-600">{error}</span>}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </div>
  );
}

function PhotoBlock({
  initialPhotoUrl,
  hasPhoto,
}: {
  initialPhotoUrl: string | null;
  hasPhoto: boolean;
}) {
  const upload = useAction();
  const del = useAction();
  return (
    <div className="mt-6 border-t border-surface-muted pt-6">
      <h3 className="font-semibold text-ink">Photo</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Stored privately. Only Heal admins can view it, and only while your
        consent is active. JPEG / PNG / WebP, up to 5 MB.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {initialPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initialPhotoUrl}
            alt="Your spotlight photo"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-surface-muted text-2xl text-ink-muted">
            🙂
          </div>
        )}
        <form
          action={(fd) => upload.run(() => uploadSpotlightPhoto(fd))}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
            required
          />
          <button type="submit" className="btn-ghost" disabled={upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload"}
          </button>
        </form>
        {hasPhoto && (
          <form action={() => del.run(() => deleteSpotlightPhoto())}>
            <button type="submit" className="btn-danger" disabled={del.isPending}>
              {del.isPending ? "Deleting…" : "Delete photo"}
            </button>
          </form>
        )}
      </div>
      {upload.error && <p className="mt-2 text-sm text-coral-600">{upload.error}</p>}
      {del.error && <p className="mt-2 text-sm text-coral-600">{del.error}</p>}
    </div>
  );
}

function ConsentBlock({
  status,
  initial,
  fallbackName,
  photoUrl,
}: {
  status: string;
  initial: SpotlightProfile | null;
  fallbackName: string | null;
  photoUrl: string | null;
}) {
  const [checked, setChecked] = useState(false);
  const grant = useAction();
  const withdraw = useAction();

  const name = initial?.display_name || fallbackName || "Your name";
  const role = initial?.headline || "Internship Participant";

  if (status === "granted") {
    return (
      <div className="mt-6 rounded-2xl border border-mint-200 bg-mint-50 p-5">
        <h3 className="font-semibold text-mint-900">You&apos;re opted in ✓</h3>
        <p className="mt-1 text-sm text-mint-800">
          Heal may feature you as described below. You can withdraw at any time.
        </p>
        <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-ink-soft">
          <strong>What you agreed to:</strong>{" "}
          {initial?.consent_scope ?? SPOTLIGHT_CONSENT_SCOPE}
        </p>
        {initial?.consent_granted_at && (
          <p className="mt-2 text-xs text-mint-700">
            Consent granted {new Date(initial.consent_granted_at).toLocaleString()}
          </p>
        )}
        <form
          action={() => withdraw.run(() => withdrawSpotlightConsent())}
          className="mt-4"
        >
          <button type="submit" className="btn-ghost" disabled={withdraw.isPending}>
            {withdraw.isPending ? "Withdrawing…" : "Withdraw consent"}
          </button>
          {withdraw.error && (
            <span className="ml-3 text-sm text-coral-600">{withdraw.error}</span>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-surface-muted bg-surface-subtle p-5">
      <h3 className="font-semibold text-ink">
        {status === "withdrawn" ? "Opt back in" : "Opt in to be featured"}
      </h3>

      {/* Plain-language disclosure */}
      <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
        <li>• <strong>What we publish:</strong> your photo, name, and role/headline.</li>
        <li>• <strong>Where:</strong> LinkedIn and Heal&apos;s own channels.</li>
        <li>• <strong>It&apos;s optional:</strong> it won&apos;t affect your internship or certificate.</li>
        <li>• <strong>You&apos;re in control:</strong> you can withdraw consent at any time.</li>
        <li>• Heal posts manually — nothing is auto-posted anywhere.</li>
      </ul>

      {/* Preview of roughly what a post would contain */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Preview
        </p>
        <div className="rounded-2xl border border-surface-muted bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-lg">🙂</div>
            )}
            <div>
              <p className="font-semibold text-ink">{name}</p>
              <p className="text-sm text-ink-muted">{role}</p>
            </div>
            <span className="ml-auto text-xs text-ink-muted">via Heal Internships</span>
          </div>
          {initial?.quote && (
            <p className="mt-3 text-sm italic text-ink-soft">“{initial.quote}”</p>
          )}
          {initial?.working_on && (
            <p className="mt-2 text-sm text-ink-soft">
              Currently working on: {initial.working_on}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            🎓 Featured as a Heal digital internship participant
          </p>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Illustrative only — Heal will compose the final post.
        </p>
      </div>

      {/* Deliberate, unchecked consent action */}
      <form
        action={(fd) => grant.run(() => grantSpotlightConsent(fd))}
        className="mt-4"
      >
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="consent"
            className="mt-1"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>{SPOTLIGHT_CONSENT_SCOPE}</span>
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={!checked || grant.isPending}>
            {grant.isPending ? "Saving…" : "I consent — feature me"}
          </button>
          {grant.error && <span className="text-sm text-coral-600">{grant.error}</span>}
        </div>
      </form>
    </div>
  );
}
