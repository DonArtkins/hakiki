"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { serviceStatus, summary, type CheckRow } from "@/lib/aggregates";
import { t } from "@/lib/i18n";
import { HistoryTable } from "./HistoryTable";
import { RiskChart } from "./RiskChart";
import { useLocale } from "./LocaleProvider";

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
  const s = summary(rows ?? []);
  const kpis = [
    { label: t(locale, "dash.total"), value: s.total }, { label: t(locale, "verdict.high"), value: s.high },
    { label: t(locale, "verdict.suspicious"), value: s.suspicious }, { label: t(locale, "verdict.safe"), value: s.safe },
  ];
  return (
    <div>
      <h1 className="display page-title">{t(locale, "dash.title")}</h1>
      <p className="muted-lede">{t(locale, "dash.intro")}</p>
      <p className="service-line">{t(locale, "dash.service")}: <strong>{serviceStatus(health) === "working" ? t(locale, "dash.working") : t(locale, "dash.limited")}</strong></p>
      {failed ? <p role="alert" className="card alert-card">{t(locale, "dash.loadFailed")}</p> : null}
      {failed ? null : rows !== null && rows.length === 0 ? (
        <section className="card empty-state">
          <h2 className="display" style={{ fontSize: 28, marginTop: 0 }}>{t(locale, "dash.emptyTitle")}</h2>
          <p>{t(locale, "dash.empty")}</p>
          <Link className="btn-primary" href="/studio">{t(locale, "dash.first")}</Link>
        </section>
      ) : (
        <>
          <div className="kpi-row">{kpis.map((k) => (<section key={k.label} className="card kpi"><p className="eyebrow">{k.label}</p><p className="kpi-value">{k.value}</p></section>))}</div>
          <p className="muted-small">{t(locale, "dash.recentNote")}</p>
          <RiskChart rows={rows ?? []} locale={locale} />
          <section className="card history-panel">
            <h2 className="eyebrow">{t(locale, "dash.history")}</h2>
            <HistoryTable rows={rows ?? []} locale={locale} />
          </section>
        </>
      )}
    </div>
  );
}
