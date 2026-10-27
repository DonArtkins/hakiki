"use client";

import { useEffect, useState } from "react";

interface LinkRow { id: string; status: string; wardId: string; guardianId: string }

export function GuardianPanel() {
  const [code, setCode] = useState("");
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const res = await fetch("/api/guardians/invite");
      if (!res.ok) return;
      const data = (await res.json()) as { guardians?: LinkRow[] };
      setLinks(data.guardians ?? []);
    } catch { /* the empty state below explains what to do */ } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  async function invite() {
    setBusy(true);
    try {
      const res = await fetch("/api/guardians/invite", { method: "POST" });
      const data = (await res.json()) as { code?: string; error?: { message: string } };
      if (data.code) { setCode(data.code); setMessage("Share this code within 24 hours. Your guardian sees the risk level only, never your messages."); }
      else setMessage(data.error?.message ?? "A code could not be created. Try again.");
    } catch { setMessage("A code could not be created. Check your connection and try again."); } finally { setBusy(false); }
  }

  async function accept() {
    setBusy(true);
    try {
      const res = await fetch("/api/guardians/accept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: acceptCode }) });
      const data = (await res.json()) as { ok?: boolean; error?: { message: string } };
      setMessage(data.ok ? "Linked. You will now get high-risk alerts with the type, risk and time only." : data.error?.message ?? "That code could not be accepted. Check it and try again.");
      if (data.ok) void refresh();
    } catch { setMessage("That code could not be accepted. Check your connection and try again."); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    await fetch("/api/guardians/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ linkId: id }) });
    void refresh();
  }

  return (
    <div>
      <h1 className="display" style={{ fontSize: 32, lineHeight: 1.15, margin: "0 0 8px" }}>Guardian mode</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, maxWidth: 620 }}>Let someone you trust get alerts. They see the risk level, never your messages.</p>

      <section className="card" style={{ padding: 20, marginTop: 20 }}>
        <h2 className="eyebrow">Invite a guardian</h2>
        <button className="btn-primary" type="button" onClick={() => void invite()} disabled={busy} aria-busy={busy}>Create invite code</button>
        {code ? (
          <p style={{ margin: "16px 0 0" }}>
            <span className="mono-code" style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4 }} aria-label={`Invite code ${code.split("").join(" ")}`}>{code}</span>
          </p>
        ) : null}
      </section>

      <section className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2 className="eyebrow">Accept an invite</h2>
        <label htmlFor="guardian-code" style={{ fontWeight: 600 }}>Invite code</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <input id="guardian-code" className="field mono-code" value={acceptCode} onChange={(e) => setAcceptCode(e.target.value.toUpperCase())} style={{ maxWidth: 240, textTransform: "uppercase", minHeight: 48 }} autoComplete="off" />
          <button className="btn-primary" type="button" onClick={() => void accept()} disabled={busy || !acceptCode.trim()} aria-busy={busy}>Accept</button>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2 className="eyebrow">Your guardians</h2>
        {loading ? <p style={{ color: "var(--muted)", margin: 0 }}>Loading...</p>
          : links.length ? (
            <ul className="evidence-list">
              {links.map((l) => (
                <li key={l.id} style={{ alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ textTransform: "capitalize" }}>{l.status}</span>
                  <button className="btn-secondary" type="button" onClick={() => void revoke(l.id)}>Revoke</button>
                </li>
              ))}
            </ul>
          ) : <p style={{ margin: 0 }}>No guardian linked yet. Create an invite code above and share it with someone you trust.</p>}
      </section>

      {message ? <p role="status" className="card fade-up" style={{ padding: 16, marginTop: 16 }}>{message}</p> : null}
    </div>
  );
}
