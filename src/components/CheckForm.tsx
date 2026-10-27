"use client";

import { useMemo, useRef, useState } from "react";
import type { RuleFinding, Verdict } from "@/engine/schemas";
import type { Span } from "@/engine/ground";
import { SAMPLES } from "@/lib/samples";
import { t, type Locale } from "@/lib/i18n";
import { VerdictCard } from "./VerdictCard";

type Stage = "extracting" | "rules" | "reasoning";
interface RulesEvent { findings: RuleFinding[]; priorScore: number; spans: Span[] }

function Highlighted({ text, spans }: { text: string; spans: Span[] }) {
  const parts = useMemo(() => {
    const out: Array<{ text: string; mark: boolean }> = [];
    let at = 0;
    for (const s of spans) {
      if (s.start < at) continue;
      out.push({ text: text.slice(at, s.start), mark: false });
      out.push({ text: text.slice(s.start, s.end), mark: true });
      at = s.end;
    }
    out.push({ text: text.slice(at), mark: false });
    return out;
  }, [text, spans]);
  return <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{parts.map((p, i) => p.mark ? <mark className="evidence" key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>)}</p>;
}

export function CheckForm() {
  const [locale, setLocale] = useState<Locale>("en");
  const [text, setText] = useState("");
  const [imageName, setImageName] = useState("");
  const imageRef = useRef<string>("");
  const [stages, setStages] = useState<Stage[]>([]);
  const [rules, setRules] = useState<RulesEvent | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [spans, setSpans] = useState<Span[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setImageName(file.name);
    imageRef.current = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    }).catch(() => "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setVerdict(null); setRules(null); setStages([]); setSpans([]);
    try {
      const res = await fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, imageDataUrl: imageRef.current || undefined, locale }) });
      if (!res.ok || !res.body) throw new Error((await res.text()).slice(0, 160) || "Check failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const chunks = buf.split("\n\n");
        buf = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const event = JSON.parse(line.slice(5)) as { type: string; stage?: Stage; findings?: RuleFinding[]; priorScore?: number; spans?: Span[]; verdict?: Verdict; error?: { message: string } };
          if (event.type === "stage" && event.stage) setStages((s) => [...new Set([...s, event.stage as Stage])]);
          if (event.type === "rules") { setRules({ findings: event.findings ?? [], priorScore: event.priorScore ?? 0, spans: event.spans ?? [] }); setSpans(event.spans ?? []); }
          if (event.type === "verdict" && event.verdict) { setVerdict(event.verdict); if (event.spans?.length) setSpans(event.spans); if (event.verdict.risk === "high" && "vibrate" in navigator) navigator.vibrate(40); }
          if (event.type === "error") setError(event.error?.message ?? "Check failed");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 8px" }}>{t(locale, "brand.tagline")}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 620 }}>{t(locale, "home.intro")}</p>
        </div>
        <div role="group" aria-label="Language" style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={() => setLocale("en")} aria-pressed={locale === "en"}>EN</button>
          <button type="button" className="btn-secondary" onClick={() => setLocale("sw")} aria-pressed={locale === "sw"}>SW</button>
        </div>
      </div>
      <form onSubmit={submit} className="card" style={{ padding: 16 }}>
        <label htmlFor="message" style={{ fontWeight: 700 }}>{locale === "sw" ? "Ujumbe unaoshuku" : "Suspicious message"}</label>
        <textarea id="message" value={text} onChange={(e) => setText(e.target.value)} placeholder={t(locale, "home.placeholder")} rows={7} style={{ width: "100%", marginTop: 8, borderRadius: 12, border: "1px solid var(--border)", padding: 12, background: "var(--bg)", color: "var(--ink)" }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <label className="btn-secondary" style={{ display: "inline-flex", alignItems: "center" }}>{t(locale, "home.upload")}<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => void onFile(e.target.files?.[0])} /></label>
          {imageName ? <span style={{ fontSize: 14, color: "var(--muted)" }}>{imageName}</span> : null}
          <button className="btn-primary" disabled={busy || (!text.trim() && !imageName)} type="submit">{busy ? (locale === "sw" ? "Inakagua…" : "Checking…") : t(locale, "home.submit")}</button>
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>{t(locale, "home.samples")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{SAMPLES.map((s) => <button type="button" key={s.id} className="chip" onClick={() => setText(s.text)}>{locale === "sw" ? s.label_sw : s.label_en}</button>)}</div>
      </form>
      {error ? <p role="alert" className="card" style={{ padding: 14, marginTop: 14, borderColor: "var(--danger)" }}>{error}</p> : null}
      {stages.length ? <div aria-live="polite" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>{stages.map((s) => <span className="chip" key={s}>{s === "extracting" ? (locale === "sw" ? "Inasoma ujumbe…" : "Reading the message…") : s === "rules" ? (locale === "sw" ? "Inakagua dalili…" : "Running Kenya scam checks…") : (locale === "sw" ? "Inachambua…" : "Thinking it through…")}</span>)}</div> : null}
      {text && (rules || verdict) ? <section className="card" style={{ padding: 16, marginTop: 14 }}><h2 style={{ marginTop: 0 }}>{locale === "sw" ? "Ujumbe wako" : "Your message"}</h2><Highlighted text={text} spans={spans} /></section> : null}
      {rules ? <section className="card" style={{ padding: 16, marginTop: 14 }}><h2 style={{ marginTop: 0 }}>{locale === "sw" ? "Dalili zilizopatikana" : "Evidence found"}</h2>{rules.findings.length ? <ul>{rules.findings.map((f) => <li key={f.id}><strong>{f.id}</strong> — {f.evidence}</li>)}</ul> : <p>{locale === "sw" ? "Hakuna dalili ya sheria iliyopatikana." : "No rule findings yet."}</p>}</section> : null}
      {verdict ? <div style={{ marginTop: 14 }}><VerdictCard verdict={verdict} /></div> : null}
    </div>
  );
}
