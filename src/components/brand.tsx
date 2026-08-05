import Image from "next/image";
import Link from "next/link";

/** Heal mark + wordmark. */
export function HealLogo({
  href = "/",
  className = "",
  onDark = false,
}: {
  href?: string | null;
  className?: string;
  /** Light wordmark, for sitting over photography rather than on white. */
  onDark?: boolean;
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
      <span
        className={`font-display text-lg font-extrabold tracking-tight ${
          onDark ? "text-white" : "text-ink"
        }`}
      >
        Heal <span className={onDark ? "text-mint-100" : "text-teal-600"}>IESP</span>
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
