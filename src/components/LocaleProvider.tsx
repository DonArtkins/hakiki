"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";
import { Logo } from "./ui";

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: "en", setLocale: () => undefined });

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function SiteHeader() {
  const { locale } = useLocale();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
        <nav className="main-nav" aria-label="Main">
          <Link className="nav-link" href="/">{t(locale, "nav.check")}</Link>
          <Link className="nav-link" href="/guardian">{t(locale, "nav.guardian")}</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { locale } = useLocale();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>{t(locale, "footer.privacy")}</span>
        <span>{t(locale, "disclaimer")}</span>
      </div>
    </footer>
  );
}
