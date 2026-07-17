import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Heal Digital Internships",
    template: "%s · Heal Digital Internships",
  },
  description:
    "Paid, verifiable digital internships — impact simulations, case studies, and real-world applications. Earn an independently verifiable certificate.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Heal Digital Internships",
    description:
      "Impact simulations, case studies & real-world applications in applied AI, ethics, and the UN SDGs — with verifiable certificates.",
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
