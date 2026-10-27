import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/ui";
import en from "@/lib/i18n/en.json";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hakiki — Check before you send",
  description: "Scam-verification agent for Kenyan mobile-money users.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="app-frame">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
              <nav className="main-nav" aria-label="Main">
                <Link className="nav-link" href="/">{en["nav.check"]}</Link>
                <Link className="nav-link" href="/guardian">{en["nav.guardian"]}</Link>
              </nav>
            </div>
          </header>
          <main className="page">{children}</main>
          <footer className="site-footer">
            <div className="site-footer-inner">
              <span>{en["footer.privacy"]}</span>
              <span>{en["disclaimer"]}</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
