import Link from "next/link";

/** Heal wordmark + mark. Uses the brand gradient. */
export function HealLogo({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-xl bg-heal-gradient text-white shadow-card"
      >
        <span className="font-display text-lg font-extrabold leading-none">H</span>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">
        Heal <span className="text-teal-600">IESP</span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Heal IESP home">
      {inner}
    </Link>
  );
}
