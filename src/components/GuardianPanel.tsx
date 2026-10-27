"use client";

import { useEffect, useState } from "react";

interface LinkRow { id: string; status: string; wardId: string; guardianId: string }

export function GuardianPanel() {
  const [code, setCode] = useState("");
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);

  async function refresh() {
    const res = await fetch("/api/guardians/invite");
    if (!res.ok) return;
    const data = (await res.json()) as { guardians?: LinkRow[] };
    setLinks(data.guardians ?? []);
  }
  useEffect(() => { void refresh(); }, []);

  async function invite() {
    const res = await fetch("/api/guardians/invite", { method: "POST" });
    const data = (await res.json()) as { code?: string; error?: { message: string } };
    if (data.code) { setCode(data.code); setMessage("Share this code within 24 hours. Your guardian sees risk level only, never your messages."); }
    else setMessage(data.error?.message ?? "Could not create a code.");
  }

  async function accept() {
    const res = await fetch("/api/guardians/accept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: acceptCode }) });
    const data = (await res.json()) as { ok?: boolean; error?: { message: string } };
    setMessage(data.ok ? "Linked. You will now get high-risk alerts with type, risk and time only." : data.error?.message ?? "Could not accept that code.");
    if (data.ok) void refresh();
  }

  async function revoke(id: string) {
    await fetch("/api/guardians/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ linkId: id }) });
    void refresh();
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>Guardian mode</h1>
      <p style={{ color: "var(--muted)" }}>Let someone you trust get alerts. They see the risk level, never your messages.</p>
      <section className="card" style={{ padding: 16 }}>
        <h2>Invite a guardian</h2>
        <button className="btn-primary" type="button" onClick={() => void invite()}>Create invite code</button>
        {code ? <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2 }}>{code}</p> : null}
      </section>
      <section className="card" style={{ padding: 16, marginTop: 14 }}>
        <h2>Accept an invite</h2>
        <label htmlFor="guardian-code">Invite code</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <input id="guardian-code" value={acceptCode} onChange={(e) => setAcceptCode(e.target.value.toUpperCase())} style={{ minHeight: 48, borderRadius: 12, border: "1px solid var(--border)", padding: "0 12px", textTransform: "uppercase" }} />
          <button className="btn-primary" type="button" onClick={() => void accept()}>Accept</button>
        </div>
      </section>
      {links.length ? <section className="card" style={{ padding: 16, marginTop: 14 }}><h2>Your guardians</h2><ul>{links.map((l) => <li key={l.id}>{l.status} <button className="btn-secondary" type="button" onClick={() => void revoke(l.id)}>Revoke</button></li>)}</ul></section> : null}
      {message ? <p role="status" className="card" style={{ padding: 14, marginTop: 14 }}>{message}</p> : null}
    </div>
  );
}
