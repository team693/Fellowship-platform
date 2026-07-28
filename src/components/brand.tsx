import Image from "next/image";
import Link from "next/link";

/** Heal mark + wordmark. */
export function HealLogo({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/heal-mark.png"
        alt=""
        aria-hidden
        width={32}
        height={32}
        priority
        className="h-8 w-8 shrink-0"
      />
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
