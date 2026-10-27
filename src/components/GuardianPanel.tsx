"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { SegmentedControl } from "./ui";
import { useLocale } from "./LocaleProvider";

interface LinkRow { id: string; status: string; wardId: string; guardianId: string }

export function GuardianPanel() {
  const { locale, setLocale } = useLocale();
  const [code, setCode] = useState("");
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const res = await fetch("/api/guardians/invite");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { guardians?: LinkRow[] };
      setLinks(data.guardians ?? []);
      setLoadFailed(false);
    } catch { setLoadFailed(true); } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  async function invite() {
    setBusy(true);
    try {
      const res = await fetch("/api/guardians/invite", { method: "POST" });
      const data = (await res.json()) as { code?: string; error?: { message: string } };
      if (data.code) { setCode(data.code); setMessage(t(locale, "guardian.codeShare")); }
      else setMessage(data.error?.message ?? t(locale, "guardian.createFailed"));
    } catch { setMessage(t(locale, "guardian.createFailedConn")); } finally { setBusy(false); }
  }

  async function accept() {
    setBusy(true);
    try {
      const res = await fetch("/api/guardians/accept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: acceptCode }) });
      const data = (await res.json()) as { ok?: boolean; error?: { message: string } };
      setMessage(data.ok ? t(locale, "guardian.linked") : data.error?.message ?? t(locale, "guardian.acceptFailed"));
      if (data.ok) void refresh();
    } catch { setMessage(t(locale, "guardian.acceptFailedConn")); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    await fetch("/api/guardians/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ linkId: id }) });
    void refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <h1 className="display" style={{ fontSize: 32, lineHeight: 1.15, margin: "0 0 8px" }}>{t(locale, "guardian.title")}</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>{t(locale, "guardian.intro")}</p>
        </div>
        <SegmentedControl label="Language" value={locale} onChange={setLocale} options={[{ value: "en", label: "EN" }, { value: "sw", label: "SW" }]} />
      </div>

      <section className="card" style={{ padding: 20, marginTop: 20 }}>
        <h2 className="eyebrow">{t(locale, "guardian.inviteTitle")}</h2>
        <button className="btn-primary" type="button" onClick={() => void invite()} disabled={busy} aria-busy={busy}>{t(locale, "guardian.create")}</button>
        {code ? (
          <p style={{ margin: "16px 0 0" }}>
            <span className="mono-code" style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4 }} aria-label={`${t(locale, "guardian.codeLabel")} ${code.split("").join(" ")}`}>{code}</span>
          </p>
        ) : null}
      </section>

      <section className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2 className="eyebrow">{t(locale, "guardian.acceptTitle")}</h2>
        <label htmlFor="guardian-code" style={{ fontWeight: 600 }}>{t(locale, "guardian.codeLabel")}</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <input id="guardian-code" className="field mono-code" value={acceptCode} onChange={(e) => setAcceptCode(e.target.value.toUpperCase())} style={{ maxWidth: 240, textTransform: "uppercase", minHeight: 48 }} autoComplete="off" />
          <button className="btn-primary" type="button" onClick={() => void accept()} disabled={busy || !acceptCode.trim()} aria-busy={busy}>{t(locale, "guardian.accept")}</button>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2 className="eyebrow">{t(locale, "guardian.yours")}</h2>
        {loading ? <p style={{ color: "var(--muted)", margin: 0 }}>{t(locale, "guardian.loading")}</p>
          : loadFailed ? <p role="alert" style={{ margin: 0 }}>{t(locale, "guardian.loadFailed")}</p>
          : links.length ? (
            <ul className="evidence-list">
              {links.map((l) => (
                <li key={l.id} style={{ alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ textTransform: "capitalize" }}>{l.status}</span>
                  <button className="btn-secondary" type="button" onClick={() => void revoke(l.id)}>{t(locale, "guardian.revoke")}</button>
                </li>
              ))}
            </ul>
          ) : <p style={{ margin: 0 }}>{t(locale, "guardian.empty")}</p>}
      </section>

      {message ? <p role="status" className="card fade-up" style={{ padding: 16, marginTop: 16 }}>{message}</p> : null}
    </div>
  );
}
