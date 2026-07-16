import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Heal Digital Fellowships",
    template: "%s · Heal Fellowships",
  },
  description:
    "Paid, verifiable digital fellowships. Work through immersive simulations on real-world macro problems and earn an independently verifiable certificate.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Heal Digital Fellowships",
    description:
      "Immersive fellowships on AI governance, ethics, and sustainability — with verifiable certificates.",
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
