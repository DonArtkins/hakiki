"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { checksPerDay, countByType, riskMix, serviceStatus, summary, type CheckRow } from "@/lib/aggregates";
import { t } from "@/lib/i18n";
import { HistoryTable, typeName } from "./HistoryTable";
import { useLocale } from "./LocaleProvider";

const FILL: Record<string, string> = { safe: "var(--safe)", suspicious: "var(--warn)", high: "var(--danger)", unclear: "var(--unclear)" };

export function Dashboard() {
  const { locale } = useLocale();
  const [rows, setRows] = useState<CheckRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [health, setHealth] = useState<{ ok: boolean; model: boolean; db: boolean } | null>(null);
  useEffect(() => {
    (async () => {
      try { const r = await fetch("/api/checks"); if (!r.ok) throw new Error("bad"); const d = (await r.json()) as { checks?: CheckRow[] }; setRows(d.checks ?? []); } catch { setFailed(true); setRows([]); }
      try { const r = await fetch("/api/health"); setHealth((await r.json()) as { ok: boolean; model: boolean; db: boolean }); } catch { setHealth(null); }
    })();
  }, []);
  const loading = rows === null && !failed;
  const s = summary(rows ?? []);
  const mix = riskMix(rows ?? []);
  const perDay = checksPerDay(rows ?? []);
  const byType = countByType(rows ?? []);
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));
  const latestLabel = s.latest ? new Date(s.latest).toLocaleString(locale === "sw" ? "sw-KE" : "en-KE") : t(locale, "dash.noLatest");
  const mixWords = mix.map((m) => `${t(locale, `verdict.${m.risk}`)}: ${m.count} (${m.pct}%)`).join(", ");
  return (
    <div>
      <h1 className="display page-title">{t(locale, "dash.title")}</h1>
      <p className="muted-lede">{t(locale, "dash.intro")}</p>
      <p className="service-line">{t(locale, "dash.service")}: <strong>{serviceStatus(health) === "working" ? t(locale, "dash.working") : t(locale, "dash.limited")}</strong></p>
      {loading ? (
        <div aria-label={t(locale, "dash.loading")} aria-busy="true" style={{ display: "grid", gap: 14 }}>
          <div className="skeleton" style={{ minHeight: 120 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div className="skeleton" style={{ minHeight: 140 }} /><div className="skeleton" style={{ minHeight: 140 }} /></div>
          <div className="skeleton" style={{ minHeight: 180 }} />
        </div>
      ) : null}
      {failed ? <p role="alert" className="card alert-card">{t(locale, "dash.loadFailed")}</p> : null}
      {!loading && !failed && rows !== null && rows.length === 0 ? (
        <section className="card empty-state">
          <h2 className="display" style={{ fontSize: 28, marginTop: 0 }}>{t(locale, "dash.emptyTitle")}</h2>
          <p>{t(locale, "dash.empty")}</p>
          <Link className="btn-primary" href="/studio">{t(locale, "dash.first")}</Link>
        </section>
      ) : null}
      {!loading && !failed && rows !== null && rows.length > 0 ? (
        <>
          <section className="card dash-hero">
            <p className="eyebrow">{t(locale, "dash.mixTitle")}</p>
            <p className="dash-hero-value">{s.total}</p>
            <p className="muted-small" style={{ margin: 0 }}>{t(locale, "dash.total")} - {t(locale, "dash.latest")}: {latestLabel}</p>
            <div className="mix-bar" role="img" aria-label={mixWords}>
              {mix.filter((m) => m.count > 0).map((m) => (<div key={m.risk} className="mix-seg" style={{ width: `${m.pct}%`, background: FILL[m.risk] }} />))}
            </div>
            <ul className="mix-legend">{mix.map((m) => (<li key={m.risk}>{t(locale, `verdict.${m.risk}`)}: <strong>{m.count}</strong> ({m.pct}%)</li>))}</ul>
            <p className="muted-small">{t(locale, "dash.recentNote")}</p>
          </section>
          <div className="dash-bento">
            <section className="card chart-card">
              <h2 className="eyebrow">{t(locale, "dash.perDay")}</h2>
              {perDay.length ? (<>
                <svg viewBox="0 0 320 170" className="chart" role="img" aria-label={perDay.map((d) => `${d.day}: ${d.count}`).join(", ")}>
                  {perDay.map((d, i) => { const h = (d.count / maxDay) * 105; const x = 20 + (280 / Math.max(1, perDay.length)) * i; return (<g key={d.day}><rect x={x} y={125 - h} width="26" height={h} rx="5" fill="var(--brand)" /><text x={x + 13} y={145} textAnchor="middle" fontSize="10" fill="currentColor">{d.count}</text></g>); })}
                </svg>
                <p className="chart-words">{perDay.map((d) => `${d.day}: ${d.count}`).join(", ")}</p>
              </>) : <p>{t(locale, "dash.none")}</p>}
            </section>
            <section className="card chart-card">
              <h2 className="eyebrow">{t(locale, "dash.typeTitle")}</h2>
              {byType.length ? (<ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>{byType.slice(0, 5).map((d) => (<li key={d.type} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>{typeName(d.type, locale)}</span><strong style={{ fontVariantNumeric: "tabular-nums" }}>{d.count}</strong></li>))}</ul>) : <p>{t(locale, "dash.none")}</p>}
              <p className="chart-words">{byType.map((d) => `${typeName(d.type, locale)}: ${d.count}`).join(", ")}</p>
            </section>
          </div>
          <section className="card history-panel">
            <h2 className="eyebrow">{t(locale, "dash.history")}</h2>
            <HistoryTable rows={rows ?? []} locale={locale} />
          </section>
        </>
      ) : null}
    </div>
  );
}
