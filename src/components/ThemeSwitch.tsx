"use client";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function ThemeSwitch() {
  const { locale } = useLocale();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("hakiki-theme"); } catch { stored = null; }
    const isDark = stored ? stored === "dark" : document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark); document.documentElement.dataset.theme = isDark ? "dark" : "light";
    window.addEventListener("hakiki-theme", sync);
    return () => window.removeEventListener("hakiki-theme", sync);
  }, []);
  function toggle() {
    const next = !dark; setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { window.localStorage.setItem("hakiki-theme", next ? "dark" : "light"); } catch { /* storage unavailable: session-only theme */ }
    window.dispatchEvent(new Event("hakiki-theme"));
  }
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label={t(locale, "theme.label")} className="theme-switch" onClick={toggle}>
      <span className="theme-track" aria-hidden="true"><span className="theme-thumb" /></span>
    </button>
  );
}
