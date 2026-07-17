import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Heal Digital Impact Internships",
    template: "%s · Heal Digital Impact Internships",
  },
  description:
    "The Digital Impact Internship — impact simulations, case studies, and real-world applications mapped to the UN SDGs. Earn a verifiable Impact Certification.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Heal Digital Impact Internships",
    description:
      "Impact simulations, case studies & real-world applications mapped to the UN SDGs — with a verifiable Impact Certification.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-surface-subtle">{children}</body>
    </html>
  );
}
