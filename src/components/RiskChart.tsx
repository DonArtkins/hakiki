"use client";
import { checksPerDay, countByRisk, countByType, type CheckRow } from "@/lib/aggregates";
import { t, type Locale } from "@/lib/i18n";
import { typeName } from "./HistoryTable";

const RISKS = ["safe", "suspicious", "high", "unclear"] as const;
const FILL: Record<string, string> = { safe: "var(--safe)", suspicious: "var(--warn)", high: "var(--danger)", unclear: "var(--unclear)" };

export function RiskChart({ rows, locale }: { rows: CheckRow[]; locale: Locale }) {
  const byRisk = countByRisk(rows); const perDay = checksPerDay(rows); const byType = countByType(rows);
  const maxRisk = Math.max(1, ...RISKS.map((r) => byRisk[r] ?? 0));
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));
  const maxType = Math.max(1, ...byType.map((d) => d.count));
  const summaryText = RISKS.map((r) => `${t(locale, `verdict.${r}`)}: ${byRisk[r] ?? 0}`).join(", ");
  return (
    <div className="charts">
      <section className="card chart-card">
        <h2 className="eyebrow">{t(locale, "dash.riskTitle")}</h2>
        <svg viewBox="0 0 320 180" className="chart" role="img" aria-label={summaryText}>
          {RISKS.map((r, i) => { const h = ((byRisk[r] ?? 0) / maxRisk) * 110; return (<g key={r}><rect x={20 + i * 78} y={140 - h} width="48" height={h} rx="6" fill={FILL[r]} /><text x={44 + i * 78} y={160} textAnchor="middle" fontSize="11" fill="currentColor">{byRisk[r] ?? 0}</text></g>); })}
        </svg>
        <p className="chart-words">{summaryText}</p>
      </section>
      <section className="card chart-card">
        <h2 className="eyebrow">{t(locale, "dash.perDay")}</h2>
        {perDay.length ? (<>
          <svg viewBox="0 0 320 180" className="chart" role="img" aria-label={perDay.map((d) => `${d.day}: ${d.count}`).join(", ")}>
            {perDay.map((d, i) => { const slot = 280 / Math.max(1, perDay.length); const w = Math.min(26, Math.max(2, slot - 4)); const h = (d.count / maxDay) * 110; const x = 20 + slot * i; return (<g key={d.day}><rect x={x} y={140 - h} width={w} height={h} rx="5" fill="var(--brand)" /><text x={x + w / 2} y={160} textAnchor="middle" fontSize="10" fill="currentColor">{d.count}</text></g>); })}
          </svg>
          <p className="chart-words">{perDay.map((d) => `${d.day}: ${d.count}`).join(", ")}</p>
        </>) : <p>{t(locale, "dash.none")}</p>}
      </section>
      <section className="card chart-card">
        <h2 className="eyebrow">{t(locale, "dash.typeTitle")}</h2>
        {byType.length ? (<>
          <svg viewBox="0 0 320 180" className="chart" role="img" aria-label={byType.map((d) => `${typeName(d.type, locale)}: ${d.count}`).join(", ")}>
            {byType.slice(0, 5).map((d, i) => (<g key={d.type}><rect x={10} y={12 + i * 32} width={(d.count / maxType) * 220} height="18" rx="5" fill="var(--brand)" /><text x={238} y={26 + i * 32} fontSize="11" fill="currentColor">{d.count}</text></g>))}
          </svg>
          <p className="chart-words">{byType.map((d) => `${typeName(d.type, locale)}: ${d.count}`).join(", ")}</p>
        </>) : <p>{t(locale, "dash.none")}</p>}
      </section>
    </div>
  );
}
