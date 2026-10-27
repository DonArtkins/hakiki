import type { Verdict } from "@/engine/schemas";

const RISK_LABEL: Record<Verdict["risk"], { en: string; sw: string; symbol: string; color: string }> = {
  safe: { en: "Looks genuine, but stay careful", sw: "Inaonekana halisi, lakini kuwa mwangalifu", symbol: "✓", color: "var(--safe)" },
  suspicious: { en: "Be careful: suspicious", sw: "Kuwa mwangalifu: inatiliwa shaka", symbol: "!", color: "var(--warn)" },
  high: { en: "Likely a scam", sw: "Huenda huu ni utapeli", symbol: "⛔", color: "var(--danger)" },
  unclear: { en: "We cannot tell yet", sw: "Hatujabaini bado", symbol: "?", color: "var(--unclear)" },
};

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const meta = RISK_LABEL[verdict.risk];
  const sw = verdict.language === "sw";
  return (
    <section className="card fade-up" aria-live="polite" style={{ padding: 18, borderTop: `6px solid ${meta.color}` }}>
      <p style={{ margin: 0, color: meta.color, fontWeight: 800 }}><span aria-hidden="true">{meta.symbol}</span> {verdict.risk.toUpperCase()}</p>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.2, margin: "6px 0" }}>{sw ? meta.sw : meta.en}</h2>
      {verdict.scamType ? <p style={{ color: "var(--muted)", marginTop: 0 }}>{verdict.scamType.replaceAll("_", " ")}</p> : null}
      <h3>{sw ? "Kwa nini" : "Why"}</h3>
      <ul>{verdict.reasons.map((r, i) => <li key={i}>{r.text}{r.ruleId ? <span className="chip" style={{ marginLeft: 8 }}>{r.ruleId}</span> : null}</li>)}</ul>
      <h3>{sw ? "Cha kufanya sasa" : "What to do now"}</h3>
      <ol>{verdict.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      {verdict.needsMore ? <p><strong>{sw ? "Tunahitaji zaidi:" : "We need more:"}</strong> {verdict.needsMore}</p> : null}
      <p style={{ color: "var(--muted)", fontSize: 14 }}>{sw ? "Si asilimia 100. Ukiwa na shaka, piga 333 au DCI 0800 722 203." : "Not 100%. If unsure, call 333 or DCI 0800 722 203."}</p>
    </section>
  );
}
