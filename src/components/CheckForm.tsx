"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RuleFinding, Verdict } from "@/engine/schemas";
import type { Span } from "@/engine/ground";
import { SAMPLES } from "@/lib/samples";
import { t } from "@/lib/i18n";
import { SegmentedControl, SeverityDot, StageStepper, type StepState } from "./ui";
import { VerdictCard } from "./VerdictCard";
import { useLocale } from "./LocaleProvider";

type Stage = "extracting" | "rules" | "reasoning";
const STAGE_ORDER: Stage[] = ["extracting", "rules", "reasoning"];
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
  return (
    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 }}>
      {parts.map((p, i) => p.mark
        ? <mark className="evidence" key={i} style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}>{p.text}</mark>
        : <span key={i}>{p.text}</span>)}
    </p>
  );
}

export function CheckForm() {
  const { locale, setLocale } = useLocale();
  const [text, setText] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageReading, setImageReading] = useState(false);
  const imageRef = useRef<string>("");
  const readGenRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [rules, setRules] = useState<RulesEvent | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [spans, setSpans] = useState<Span[]>([]);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const gen = ++readGenRef.current;
    setImageReading(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    }).catch(() => "");
    if (gen !== readGenRef.current) return; // a newer pick or a reset superseded this read
    setImageReading(false);
    if (!dataUrl) { setError(t(locale, "error.imageRead")); return; }
    imageRef.current = dataUrl;
    setImageName(file.name);
  }

  function removeImage() {
    readGenRef.current += 1;
    setImageReading(false);
    setImageName(""); imageRef.current = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function reset(nextText = "") {
    setText(nextText); setVerdict(null); setRules(null); setStages([]); setSpans([]);
    setError(""); setCheckId(null); setActionNote(""); removeImage();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!online) { setError(t(locale, "error.offline")); return; }
    setBusy(true); setError(""); setVerdict(null); setRules(null); setStages([]); setSpans([]); setCheckId(null); setActionNote("");
    let gotVerdict = false;
    let gotError = false;
    try {
      const res = await fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, imageDataUrl: imageRef.current || undefined, locale }) });
      if (res.status === 429) { setError(t(locale, "error.rateLimited")); return; }
      if (!res.ok || !res.body) throw new Error("failed");
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
          const event = JSON.parse(line.slice(5)) as { type: string; stage?: Stage; findings?: RuleFinding[]; priorScore?: number; spans?: Span[]; verdict?: Verdict; checkId?: string; error?: { message: string } };
          if (event.type === "stage" && event.stage) setStages((s) => [...new Set([...s, event.stage as Stage])]);
          if (event.type === "rules") { setRules({ findings: event.findings ?? [], priorScore: event.priorScore ?? 0, spans: event.spans ?? [] }); setSpans(event.spans ?? []); }
          if (event.type === "verdict" && event.verdict) { gotVerdict = true; setVerdict(event.verdict); if (event.spans?.length) setSpans(event.spans); if (event.verdict.risk === "high" && "vibrate" in navigator && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate(40); }
          if (event.type === "done" && event.checkId) setCheckId(event.checkId);
          if (event.type === "error") { gotError = true; setError(event.error?.message ?? t(locale, "error.generic")); }
        }
      }
      if (!gotVerdict && !gotError) setError(online ? t(locale, "error.generic") : t(locale, "error.offline"));
    } catch {
      setError(online ? t(locale, "error.generic") : t(locale, "error.offline"));
    } finally {
      setBusy(false);
    }
  }

  async function act(kind: "share" | "wrong") {
    if (!checkId) return;
    try {
      if (kind === "share") {
        const res = await fetch(`/api/checks/${checkId}/share`, { method: "POST" });
        const data = (await res.json()) as { slug?: string };
        if (!data.slug) throw new Error("failed");
        await navigator.clipboard.writeText(`${window.location.origin}/s/${data.slug}`);
        setActionNote(t(locale, "action.shareCopied"));
      } else {
        const res = await fetch(`/api/checks/${checkId}/feedback`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ verdict_feedback: "wrong_scam" }) });
        if (!res.ok) throw new Error("failed");
        setActionNote(t(locale, "action.thanks"));
      }
    } catch {
      setActionNote(kind === "share" ? t(locale, "action.shareFailed") : t(locale, "action.feedbackFailed"));
    }
  }

  const failed = Boolean(error) && !verdict;
  const stepperSteps = STAGE_ORDER.map((s, i) => {
    const laterVisited = stages.length > i + 1;
    const state: StepState = verdict || laterVisited ? "done" : stages.includes(s) && !failed ? "active" : "pending";
    const stateLabel = state === "done" ? t(locale, "stage.done") : state === "active" ? t(locale, "stage.active") : failed && stages.includes(s) ? t(locale, "stage.unfinished") : t(locale, "stage.pending");
    return { label: t(locale, `stage.${s}`), state, stateLabel };
  });
  const showStepper = busy || verdict !== null || stages.length > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <h1 className="display" style={{ fontSize: 36, lineHeight: 1.1, margin: "0 0 8px" }}>{t(locale, "brand.tagline")}</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>{t(locale, "home.intro")}</p>
        </div>
        <SegmentedControl label="Language" value={locale} onChange={setLocale} disabled={busy} options={[{ value: "en", label: "EN" }, { value: "sw", label: "SW" }]} />
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 20, marginTop: 20 }}>
        <label htmlFor="message" style={{ fontWeight: 700 }}>{t(locale, "home.label")}</label>
        <textarea id="message" className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={t(locale, "home.placeholder")} rows={7} style={{ marginTop: 10 }} disabled={busy} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <label className="btn-secondary" style={{ position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0 4 4m-4-4L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {t(locale, "home.upload")}
            <input ref={fileInputRef} className="file-input" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onClick={(e) => { (e.target as HTMLInputElement).value = ""; }} onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          {imageName ? (
            <span className="chip" style={{ cursor: "default" }}>{imageName}
              <button type="button" onClick={removeImage} disabled={busy} aria-label={t(locale, "home.imageRemove")} style={{ border: 0, background: "transparent", cursor: "pointer", fontWeight: 700, minWidth: 48, minHeight: 48 }}>x</button>
            </span>
          ) : null}
          <button className="btn-primary" disabled={busy || imageReading || (!text.trim() && !imageName)} type="submit" aria-busy={busy}>
            {busy ? t(locale, "home.checking") : t(locale, "home.submit")}
          </button>
          {verdict ? <button type="button" className="btn-secondary" onClick={() => reset()}>{t(locale, "home.another")}</button> : null}
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", display: "flex", gap: 8, alignItems: "center", margin: "14px 0 0" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg>
          {t(locale, "home.privacy")}
        </p>
        <p className="eyebrow" style={{ marginTop: 18 }}>{t(locale, "home.samples")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLES.map((s) => <button type="button" key={s.id} className="chip" disabled={busy} onClick={() => reset(s.text)}>{locale === "sw" ? s.label_sw : s.label_en}</button>)}
        </div>
      </form>

      {showStepper ? <div style={{ marginTop: 16 }}><StageStepper steps={stepperSteps} /></div> : null}

      {error ? (
        <section role="alert" className="card" style={{ padding: 18, marginTop: 16, borderColor: "var(--danger)" }}>
          <p style={{ margin: 0 }}>{error}</p>
        </section>
      ) : null}

      {text && (rules || verdict) ? (
        <section className="card" style={{ padding: 20, marginTop: 16 }}>
          <h2 className="eyebrow">{t(locale, "check.message")}</h2>
          <Highlighted text={text} spans={spans} />
        </section>
      ) : null}

      {rules ? (
        <section className="card" style={{ padding: 20, marginTop: 16 }}>
          <h2 className="eyebrow">{t(locale, "check.evidence")}</h2>
          {rules.findings.length ? (
            <ul className="evidence-list">
              {rules.findings.map((f) => <li key={f.id}><SeverityDot severity={f.severity} label={t(locale, `severity.${f.severity}`)} /><span>{f.evidence}</span></li>)}
            </ul>
          ) : <p style={{ margin: 0 }}>{t(locale, "check.noEvidence")}</p>}
        </section>
      ) : null}

      {verdict ? (
        <div style={{ marginTop: 16 }}>
          <VerdictCard verdict={verdict} />
          {checkId ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <a className="btn-primary" href="tel:333" style={{ textDecoration: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                {t(locale, "action.call333")}
              </a>
              <button type="button" className="btn-secondary" onClick={() => void act("share")}>{t(locale, "action.share")}</button>
              <button type="button" className="btn-secondary" onClick={() => void act("wrong")}>{t(locale, "action.wrong")}</button>
            </div>
          ) : null}
          {actionNote ? <p role="status" style={{ color: "var(--muted)", marginTop: 10 }}>{actionNote}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
