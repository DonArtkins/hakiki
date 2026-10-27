import type { Verdict } from "@/engine/schemas";
import { TAXONOMY } from "@/engine/taxonomy";
import { t, type Locale } from "@/lib/i18n";
import { RiskBadge, SeverityDot, StripedMeter } from "./ui";

const RISK_COLOR: Record<Verdict["risk"], string> = {
  safe: "var(--safe)", suspicious: "var(--warn)", high: "var(--danger)", unclear: "var(--unclear)",
};

export function VerdictCard({ verdict, locale }: { verdict: Verdict; locale?: Locale }) {
  const loc: Locale = locale ?? (verdict.language === "sw" ? "sw" : "en");
  const type = TAXONOMY.find((x) => x.id === verdict.scamType);
  const typeName = type ? (loc === "sw" ? type.name_sw : type.name_en) : verdict.scamType?.replaceAll("_", " ");
  const confWord = verdict.confidence >= 0.75 ? t(loc, "verdict.confHigh") : verdict.confidence >= 0.45 ? t(loc, "verdict.confMedium") : t(loc, "verdict.confLow");
  return (
    <section className="card fade-up" aria-live="polite" style={{ padding: 20, borderTop: `6px solid ${RISK_COLOR[verdict.risk]}` }}>
      <RiskBadge risk={verdict.risk} label={t(loc, `verdict.${verdict.risk}`)} />
      {typeName ? <h2 className="display" style={{ fontSize: 28, lineHeight: 1.2, margin: "12px 0 0" }}>{typeName}</h2> : null}
      <p className="eyebrow" style={{ marginTop: 18 }}>{t(loc, "verdict.confidence")}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}><StripedMeter value={verdict.confidence} color={RISK_COLOR[verdict.risk]} label={t(loc, "verdict.confidence")} /></div>
        <strong style={{ fontSize: 14 }}>{confWord}</strong>
      </div>
      <h3 className="eyebrow" style={{ marginTop: 20 }}>{t(loc, "verdict.why")}</h3>
      <ul className="evidence-list">
        {verdict.reasons.map((r, i) => (
          <li key={i}><SeverityDot severity={r.severity} label={t(loc, `severity.${r.severity}`)} /><span>{r.text}</span></li>
        ))}
      </ul>
      <h3 className="eyebrow" style={{ marginTop: 20 }}>{t(loc, "verdict.next")}</h3>
      <ol className="steps-list">{verdict.nextSteps.map((s, i) => <li key={i}><span>{s}</span></li>)}</ol>
      {verdict.needsMore ? <p style={{ marginTop: 14 }}><strong>{t(loc, "verdict.needsMore")}</strong> {verdict.needsMore}</p> : null}
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 0, marginTop: 16 }}>{t(loc, "disclaimer")}</p>
    </section>
  );
}
