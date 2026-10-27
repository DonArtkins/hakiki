"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { t } from "@/lib/i18n";
import { Logo, SegmentedControl } from "./ui";
import { ThemeSwitch } from "./ThemeSwitch";
import { useLocale } from "./LocaleProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { locale, setLocale } = useLocale();
  const isLanding = path === "/";
  const links = [
    { href: "/", key: "nav.home" }, { href: "/studio", key: "nav.studio" },
    { href: "/dashboard", key: "nav.dashboard" }, { href: "/guardian", key: "nav.guardian" },
  ];
  const controls = (
    <div className="shell-controls">
      <SegmentedControl label="Language" value={locale} onChange={setLocale} options={[{ value: "en", label: "EN" }, { value: "sw", label: "SW" }]} />
      <ThemeSwitch />
    </div>
  );
  if (isLanding) {
    return (
      <div className="landing-shell">
        <header className="landing-top">
          <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
          {controls}
        </header>
        <main>{children}</main>
        <footer className="site-footer"><div className="landing-foot"><span>{t(locale, "footer.privacy")}</span><span>{t(locale, "disclaimer")}</span></div></footer>
      </div>
    );
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
        <nav className="side-nav" aria-label="Main">
          {links.map((l) => <Link key={l.href} href={l.href} className="side-link" aria-current={path === l.href ? "page" : undefined}>{t(locale, l.key)}</Link>)}
        </nav>
        <div className="sidebar-foot">{controls}<p>{t(locale, "footer.privacy")}</p></div>
      </aside>
      <div className="shell-main">
        <header className="mobile-top">
          <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
          {controls}
        </header>
        <nav className="mobile-nav" aria-label="Main">
          {links.map((l) => <Link key={l.href} href={l.href} className="side-link" aria-current={path === l.href ? "page" : undefined}>{t(locale, l.key)}</Link>)}
        </nav>
        <main className="shell-page">{children}</main>
        <footer className="site-footer"><div className="landing-foot"><span>{t(locale, "disclaimer")}</span></div></footer>
      </div>
    </div>
  );
}
