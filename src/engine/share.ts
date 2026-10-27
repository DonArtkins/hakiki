import { randomBytes } from "node:crypto";
import type { Verdict } from "./schemas";

// Share cards carry the verdict and scam type only: never message text, names or numbers
// (F07-AC1). Image generation (Muse Image background + deterministic text overlay) is P1.
export function createShareSlug(): string {
  return randomBytes(9).toString("base64url");
}

export interface ShareCardData {
  risk: Verdict["risk"];
  scamType: string | null;
  confidence: number;
  reasons: Array<{ text: string; severity: string }>;
  nextSteps: string[];
  language: string;
}

export function shareCardData(v: Verdict): ShareCardData {
  return {
    risk: v.risk,
    scamType: v.scamType,
    confidence: v.confidence,
    reasons: v.reasons.map((r) => ({ text: r.text, severity: r.severity })),
    nextSteps: v.nextSteps,
    language: v.language,
  };
}

export function shareText(v: Verdict): string {
  const type = v.scamType ? ` (${v.scamType.replaceAll("_", " ")})` : "";
  return v.language === "sw"
    ? `Hakiki: ukaguzi huu ni ${v.risk}${type}. Hakiki kabla ya kutuma pesa.`
    : `Hakiki check: ${v.risk}${type}. Check before you send money.`;
}
