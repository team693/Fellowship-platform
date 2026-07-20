import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin" };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/fellowships", label: "Programs" },
  { href: "/admin/spotlight", label: "Spotlight" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <div className="border-b border-surface-muted bg-white">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-ink-soft hover:border-teal-300 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
