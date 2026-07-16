import type { Config } from "tailwindcss";

/**
 * Heal brand design system.
 * Palette: teal / mint / coral / blue / gold.
 * Fonts are wired via CSS variables set by next/font in src/lib/fonts.ts
 * and exposed to Tailwind below.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette with tonal scales.
        teal: {
          50: "#e8f7f5",
          100: "#c7ece8",
          200: "#93dcd4",
          300: "#57c6bb",
          400: "#2ba99d",
          500: "#0f8b80",
          600: "#0a6f67",
          700: "#0b5953",
          800: "#0c4844",
          900: "#0b3b38",
          DEFAULT: "#0f8b80",
        },
        mint: {
          50: "#effcf4",
          100: "#d6f7e3",
          200: "#aeeecb",
          300: "#79dfab",
          400: "#45c887",
          500: "#22ad6c",
          600: "#158a56",
          700: "#146e47",
          800: "#14573a",
          900: "#114831",
          DEFAULT: "#45c887",
        },
        coral: {
          50: "#fff1ed",
          100: "#ffddd4",
          200: "#ffbaa8",
          300: "#ff8e73",
          400: "#fb5f3d",
          500: "#ef4423",
          600: "#c93316",
          700: "#a52815",
          800: "#882518",
          900: "#71231a",
          DEFAULT: "#fb5f3d",
        },
        brandblue: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8db6ff",
          400: "#578eff",
          500: "#3163fb",
          600: "#1c43f0",
          700: "#1732dc",
          800: "#1a2cb2",
          900: "#1b2d8c",
          DEFAULT: "#3163fb",
        },
        gold: {
          50: "#fdf9ed",
          100: "#f9eecb",
          200: "#f2da93",
          300: "#ecc25b",
          400: "#e6a92f",
          500: "#d98e1e",
          600: "#c06d18",
          700: "#9f4f18",
          800: "#823e1a",
          900: "#6c3418",
          DEFAULT: "#e6a92f",
        },
        // Semantic ink / surface tokens for consistent theming.
        ink: {
          DEFAULT: "#0b1f1d",
          soft: "#33413f",
          muted: "#5c6b69",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f6faf9",
          muted: "#eef4f3",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "var(--font-inter)",
          "var(--font-plex-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        urdu: ["var(--font-nastaliq)", "serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 31, 29, 0.04), 0 8px 24px rgba(11, 31, 29, 0.06)",
        lift: "0 12px 40px rgba(11, 31, 29, 0.12)",
      },
      backgroundImage: {
        "heal-gradient":
          "linear-gradient(135deg, #0f8b80 0%, #45c887 45%, #3163fb 100%)",
        "heal-warm": "linear-gradient(135deg, #fb5f3d 0%, #e6a92f 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
