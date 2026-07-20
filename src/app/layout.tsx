import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IESP — Heal Social Foundation",
    template: "%s · IESP",
  },
  description:
    "IESP — the Immersive Experience & Simulation Program. Impact simulations, case studies, and real-world applications mapped to the UN SDGs. Earn a verifiable Impact Certification.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "IESP — Heal Social Foundation",
    description:
      "The Immersive Experience & Simulation Program — impact simulations, case studies & real-world applications mapped to the UN SDGs — with a verifiable Impact Certification.",
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
