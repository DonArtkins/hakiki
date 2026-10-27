"use client";
import Link from "next/link";
import { TAXONOMY } from "@/engine/taxonomy";
import type { CheckRow } from "@/lib/aggregates";
import { t, type Locale } from "@/lib/i18n";
import { RiskBadge } from "./ui";
import type { Risk } from "@/engine/schemas";

export function typeName(id: string | null, locale: Locale): string {
  if (!id || id === "unknown") return t(locale, "dash.noType");
  const found = TAXONOMY.find((x) => x.id === id);
  return found ? (locale === "sw" ? found.name_sw : found.name_en) : t(locale, "dash.none");
}
export function HistoryTable({ rows, locale, compact = false }: { rows: CheckRow[]; locale: Locale; compact?: boolean }) {
  if (!rows.length) return <p style={{ margin: 0 }}>{t(locale, "studio.historyEmpty")}</p>;
  return (
    <div className="table-wrap">
      <table className="history-table">
        <thead><tr><th>{t(locale, "dash.risk")}</th><th>{t(locale, "dash.type")}</th>{compact ? null : <th>{t(locale, "dash.language")}</th>}<th>{t(locale, "dash.time")}</th><th><span className="sr-only">{t(locale, "dash.view")}</span></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><RiskBadge risk={(["safe", "suspicious", "high", "unclear"].includes(r.risk) ? r.risk : "unclear") as Risk} label={t(locale, `verdict.${r.risk}`)} /></td>
              <td>{typeName(r.scamTypeId, locale)}</td>
              {compact ? null : <td>{r.language.toUpperCase()}</td>}
              <td><time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleString(locale === "sw" ? "sw-KE" : "en-KE")}</time></td>
              <td><Link href={`/result/${r.id}`}>{t(locale, "history.view")}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
