import type { Metadata } from "next";
import "./globals.css";
import { Fraunces, Inter } from "next/font/google";
import { LocaleProvider, SiteFooter, SiteHeader } from "@/components/LocaleProvider";

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hakiki: Check before you send",
  description: "Scam-verification agent for Kenyan mobile-money users.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <LocaleProvider>
          <div className="app-frame">
            <SiteHeader />
            <main className="page">{children}</main>
            <SiteFooter />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
