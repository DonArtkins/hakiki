"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";
import { serviceStatus } from "@/lib/aggregates";
import { Logo, SegmentedControl } from "./ui";
import { ThemeSwitch } from "./ThemeSwitch";
import { useLocale } from "./LocaleProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { locale, setLocale } = useLocale();
  const isLanding = path === "/";
  const [count, setCount] = useState<number | null>(null);
  const [health, setHealth] = useState<{ ok: boolean; model: boolean; db: boolean } | null>(null);
  useEffect(() => {
    if (isLanding) return;
    (async () => {
      try { const r = await fetch("/api/checks"); if (r.ok) { const d = (await r.json()) as { checks?: unknown[] }; setCount(Array.isArray(d.checks) ? d.checks.length : 0); } } catch { setCount(null); }
      try { const r = await fetch("/api/health"); if (r.ok) setHealth((await r.json()) as { ok: boolean; model: boolean; db: boolean }); } catch { setHealth(null); }
    })();
  }, [isLanding, path]);
  const groups: Array<{ labelKey: string; links: Array<{ href: string; key: string }> }> = [
    { labelKey: "shell.sectionCheck", links: [{ href: "/studio", key: "nav.studio" }, { href: "/", key: "nav.home" }] },
    { labelKey: "shell.sectionReview", links: [{ href: "/dashboard", key: "nav.dashboard" }] },
    { labelKey: "shell.sectionCare", links: [{ href: "/guardian", key: "nav.guardian" }] },
  ];
  const flat = groups.flatMap((g) => g.links);
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
  const status = serviceStatus(health);
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
        <nav className="side-nav" aria-label="Main">
          {groups.map((g) => (
            <div key={g.labelKey} className="side-group">
              <p className="side-group-label">{t(locale, g.labelKey)}</p>
              {g.links.map((l) => (
                <Link key={l.href} href={l.href} className="side-link" aria-current={path === l.href ? "page" : undefined}>
                  <span>{t(locale, l.key)}</span>
                  {l.href === "/dashboard" && count !== null ? <span className="side-badge">{count} {t(locale, "shell.checksCount")}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <p className="service-line" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="service-dot" style={{ background: status === "working" ? "var(--safe)" : "var(--warn)" }} aria-hidden="true" />
          {t(locale, "dash.service")}: <strong>{status === "working" ? t(locale, "dash.working") : t(locale, "dash.limited")}</strong>
        </p>
        <div className="sidebar-foot">{controls}<p>{t(locale, "footer.privacy")}</p></div>
      </aside>
      <div className="shell-main">
        <header className="mobile-top">
          <Link href="/" className="wordmark"><Logo /><span className="wordmark-name">hakiki</span></Link>
          {controls}
        </header>
        <nav className="mobile-nav" aria-label="Main">
          {flat.map((l) => <Link key={l.href} href={l.href} className="side-link" aria-current={path === l.href ? "page" : undefined}>{t(locale, l.key)}</Link>)}
        </nav>
        <main className="shell-page">{children}</main>
        <footer className="site-footer"><div className="landing-foot"><span>{t(locale, "disclaimer")}</span></div></footer>
      </div>
    </div>
  );
}
