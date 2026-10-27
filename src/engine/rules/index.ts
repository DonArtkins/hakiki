import type { Extraction, Risk, RuleFinding, Severity } from "../schemas";
import { findMpesaCodes, parseMpesaCode } from "./mpesa";
import { findPhones } from "./phone";
import { checkUrlShape, findUrls } from "./url";
import { matchPhrases, uppercaseRatio } from "./phrases";

export interface RulesResult {
  findings: RuleFinding[];
  priorScore: number;
  floor: Risk | null;
}

function spanOf(text: string, needle: string | null): { start: number; end: number } | null {
  if (!needle) return null;
  const start = text.toLowerCase().indexOf(needle.toLowerCase());
  return start < 0 ? null : { start, end: start + needle.length };
}

function add(findings: RuleFinding[], text: string, id: string, severity: Severity, weight: number, evidence: string, needle: string | null) {
  findings.push({ id, severity, weight, evidence: evidence.slice(0, 200), span: spanOf(text, needle ?? evidence) });
}

// R01-R14 (docs/03 section 5). Pure and deterministic: same extraction in, same findings out.
export function runRules(extraction: Extraction, now = new Date()): RulesResult {
  const text = extraction.text ?? "";
  const findings: RuleFinding[] = [];
  const codes = extraction.mpesaCodes.length ? extraction.mpesaCodes : findMpesaCodes(text);
  const phones = extraction.phones.length ? extraction.phones : findPhones(text);
  const urls = extraction.urls.length ? extraction.urls : findUrls(text);
  const claimsMpesa = /m-?pesa/i.test(text) || (extraction.claimsToBe ?? "").toLowerCase().includes("mpesa");

  for (const code of codes) {
    const parsed = parseMpesaCode(code, now);
    if (!parsed.ok) add(findings, text, "R01", "medium", 45, `M-Pesa code pattern ${code.slice(0, 3)}... does not fit a real transaction date`, code);
  }
  if (claimsMpesa && extraction.sender && extraction.sender.trim().toUpperCase() !== "MPESA") {
    add(findings, text, "R02", "high", 35, `Sender is "${extraction.sender.slice(0, 40)}", not MPESA`, extraction.sender);
  }
  if (claimsMpesa && extraction.hasBalanceLine === false) {
    add(findings, text, "R03", "high", 30, "No M-PESA balance line in a message claiming to be a confirmation", null);
  }
  const phraseRules: Array<[string, string, Severity, number, string]> = [
    ["reversal", "R04", "high", 50, "Asks you to send money back after a claimed mistake"],
    ["urgency", "R05", "medium", 15, "Uses urgency or a threat to rush you"],
    ["feeToUnlock", "R08", "high", 30, "Asks for a fee before a job, loan or prize is released"],
    ["prize", "R09", "medium", 15, "Promises a prize, bonus or cashback without verifiable context"],
    ["otpPin", "R10", "critical", 50, "Asks for a PIN, OTP or ID number"],
    ["investment", "R11", "high", 30, "Promises guaranteed or doubled returns"],
  ];
  for (const [key, id, severity, weight, evidence] of phraseRules) {
    const hit = matchPhrases(text, key);
    if (hit) add(findings, text, id, severity, weight, evidence, hit);
  }
  const sendHit = matchPhrases(text, "sendToOther");
  if (sendHit && phones.length > 0) add(findings, text, "R06", "medium", 20, "Asks you to send money to a number in the message", sendHit);
  for (const url of urls) {
    const shape = checkUrlShape(url);
    if (shape.suspicious) {
      const strong = shape.reasons.some((r) => r.startsWith("lookalike:") || r === "ip-host" || r === "punycode");
      add(findings, text, "R07", strong ? "high" : "medium", strong ? 30 : 18, `Link host ${shape.host} looks unsafe (${shape.reasons.join(", ")})`, url);
    }
  }
  const careHit = matchPhrases(text, "fakeCare");
  if (careHit && /(pin|otp|code|confirm|send|tuma|thibitisha)/i.test(text)) {
    add(findings, text, "R12", "high", 30, "Claims to be customer care and asks you to send or confirm a code", careHit);
  }
  const distinctAmounts = new Set(extraction.amounts.map((a) => a.value));
  if (distinctAmounts.size > 1 && /(does not match|mismatch|tofauti|not the amount|si kiasi)/i.test(text)) {
    add(findings, text, "R13", "medium", 15, "Amounts in the message do not match each other", null);
  }
  if (uppercaseRatio(text) > 0.65) add(findings, text, "R14", "low", 5, "Shouting tone: mostly capital letters", null);

  const priorScore = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const floor: Risk | null = findings.some((f) => f.severity === "critical") || priorScore >= 70
    ? "high"
    : priorScore >= 35
      ? "suspicious"
      : null;
  return { findings, priorScore, floor };
}

export function hasGenuineSignals(extraction: Extraction, findings: readonly RuleFinding[], now = new Date()): boolean {
  const codes = extraction.mpesaCodes.length ? extraction.mpesaCodes : findMpesaCodes(extraction.text ?? "");
  return extraction.sender?.trim().toUpperCase() === "MPESA"
    && codes.length > 0
    && codes.every((c) => parseMpesaCode(c, now).ok)
    && extraction.hasBalanceLine === true
    && findings.length === 0;
}
