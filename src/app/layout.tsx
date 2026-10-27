import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hakiki — Check before you send",
  description: "Scam-verification agent for Kenyan mobile-money users.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--brand)", textDecoration: "none" }}>hakiki</Link>
            <nav aria-label="Main" style={{ display: "flex", gap: 14, fontSize: 14 }}>
              <Link href="/">Check</Link><Link href="/guardian">Guardian</Link>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 48px" }}>{children}</main>
      </body>
    </html>
  );
}
