// Registry primitives (docs/07 section 6; conventions in the UI registry).
// Inline SVG icons only: risk is always icon + word, never colour alone, never emoji.
import type { Risk } from "@/engine/schemas";

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Hakiki">
      <path d="M32 4 8 12v18c0 15 10 26 24 30 14-4 24-15 24-30V12L32 4Z" fill="var(--brand)" />
      <path d="M20 33l8 8 17-18" fill="none" stroke="var(--brand-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 46l-4 8 10-5" fill="var(--brand)" />
    </svg>
  );
}

function RiskIcon({ risk }: { risk: Risk }) {
  if (risk === "safe") return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--safe-soft)" /><path d="M8 12.5l2.6 2.6L16 9.5" stroke="var(--safe-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (risk === "unclear") return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--unclear-soft)" /><path d="M9.5 9.3A2.6 2.6 0 1 1 12 12.4v1" stroke="var(--unclear-text)" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16.6" r="1.3" fill="var(--unclear-text)" /></svg>);
  const color = risk === "high" ? "var(--danger-text)" : "var(--warn-text)";
  const soft = risk === "high" ? "var(--danger-soft)" : "var(--warn-soft)";
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 22 20H2Z" fill={soft} /><path d="M12 9.5v4.6" stroke={color} strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="17.2" r="1.3" fill={color} /></svg>);
}

export function RiskBadge({ risk, label }: { risk: Risk; label: string }) {
  const color = risk === "safe" ? "var(--safe-text)" : risk === "high" ? "var(--danger-text)" : risk === "suspicious" ? "var(--warn-text)" : "var(--unclear-text)";
  return <span className="risk-badge" style={{ color }}><RiskIcon risk={risk} />{label}</span>;
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export type StepState = "done" | "active" | "pending";
export function StageStepper({ steps }: { steps: Array<{ label: string; state: StepState }> }) {
  return (
    <ol className="stepper" aria-live="polite">
      {steps.map((s) => (
        <li key={s.label} data-state={s.state}>
          <span className="step-dot" aria-hidden="true">
            {s.state === "done" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 9.5 18 20 6" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : s.state === "active" ? <span className="spinner" /> : null}
          </span>
          {s.label}
        </li>
      ))}
    </ol>
  );
}

export function StripedMeter({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      <div className="meter" role="img" aria-label={`${label}: ${pct}%`}>
        <div className="meter-fill" style={{ width: `${pct}%`, background: `repeating-linear-gradient(45deg, ${color} 0 3px, color-mix(in srgb, ${color} 30%, transparent) 3px 6px)` }} />
      </div>
    </div>
  );
}

export function SeverityDot({ severity }: { severity: "critical" | "high" | "medium" | "low" }) {
  const map = {
    critical: { bg: "var(--danger-soft)", fg: "var(--danger-text)", mark: "!" },
    high: { bg: "var(--danger-soft)", fg: "var(--danger-text)", mark: "!" },
    medium: { bg: "var(--warn-soft)", fg: "var(--warn-text)", mark: "!" },
    low: { bg: "var(--unclear-soft)", fg: "var(--unclear-text)", mark: "i" },
  } as const;
  const s = map[severity];
  return <span className="sev-dot" style={{ background: s.bg, color: s.fg, fontWeight: 800, fontSize: 13 }} aria-hidden="true">{s.mark}</span>;
}
