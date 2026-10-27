import type { Config } from "tailwindcss";

// Tokens are CSS custom properties in src/app/globals.css (docs/07); Tailwind maps names to them.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    bg: "var(--bg)", surface: "var(--surface)", ink: "var(--ink)", muted: "var(--muted)",
    brand: "var(--brand)", safe: "var(--safe)", warn: "var(--warn)", danger: "var(--danger)",
    unclear: "var(--unclear)", highlight: "var(--highlight)", border: "var(--border)",
  }, fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui"] } } },
  plugins: [],
} satisfies Config;
