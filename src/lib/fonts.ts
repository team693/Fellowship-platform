import {
  Bricolage_Grotesque,
  Inter,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Noto_Nastaliq_Urdu,
} from "next/font/google";

/**
 * All fonts are loaded through `next/font/google`, which downloads and
 * SELF-HOSTS the font files at build time and serves them from our own
 * domain (no runtime request to fonts.googleapis.com). This keeps the app
 * shell rendering correctly on locked-down partner networks.
 *
 * For the embedded HTML modules, fonts are additionally served from our
 * /fonts route via public/fonts/fonts.css (see the fetch-assets script),
 * so modules never depend on a third-party CDN at runtime either.
 */

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-nastaliq",
  weight: ["400", "500", "600", "700"],
});

/** Combined CSS-variable class list for the <html> element. */
export const fontVariables = [
  bricolage.variable,
  inter.variable,
  plexSans.variable,
  plexMono.variable,
  nastaliq.variable,
].join(" ");
