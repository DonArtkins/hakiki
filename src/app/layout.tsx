import type { Metadata } from "next";
import "./globals.css";
import { Fraunces, Inter } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import { AppShell } from "@/components/AppShell";

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hakiki: Check before you send",
  description: "Scam-verification agent for Kenyan mobile-money users.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [ { url: "/logo.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" } ],
    apple: "/apple-touch-icon.png",
  },
};

const themeInit = `try{var t=localStorage.getItem('hakiki-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>
        <LocaleProvider>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
