import type { Risk } from "@/engine/schemas";

// Guardian notification content (SDR-008/R1-R3): scam type + risk + time ONLY.
// This builder is the single place that shapes the message, so no caller can leak content.
export interface GuardianAlert {
  scamType: string | null;
  risk: Risk;
  at: Date;
}

export function buildGuardianMessage(a: GuardianAlert, locale: "en" | "sw"): string {
  const when = a.at.toISOString();
  const type = a.scamType ?? "unknown";
  return locale === "sw"
    ? `Hakiki: ukaguzi wa hatari (${a.risk}) — ${type} — ${when}. Hakuna ujumbe uliosomwa.`
    : `Hakiki: high-risk check (${a.risk}) — ${type} — ${when}. No message content shared.`;
}
