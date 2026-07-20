/**
 * Legal disclosure + trust credentials. Required, unhidden, on the landing
 * page, the pricing page, and this footer itself — never behind a click.
 */
export function TrustFooter() {
  return (
    <div className="border-t border-surface-muted bg-surface-subtle">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">
          This is a paid learning program. Participants pay tuition; no
          stipend is offered. Heal Social Foundation is a Section 42
          non-profit registered with SECP (CUIN 0265422).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-muted">
          <span>NTN E445846</span>
          <span className="h-1 w-1 rounded-full bg-surface-muted" aria-hidden />
          <span>PCP Certification — applied</span>
          <span className="h-1 w-1 rounded-full bg-surface-muted" aria-hidden />
          <span>Partner: Ziauddin University (MOU)</span>
        </div>
      </div>
    </div>
  );
}
