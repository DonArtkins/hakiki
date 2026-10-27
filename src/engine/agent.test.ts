import { describe, expect, it } from "vitest";
import { enforceGuards, rulesOnlyVerdict } from "./agent";
import { extractFromText } from "./extract";
import { runRules } from "./rules";
import { EvidencePack, Verdict } from "./schemas";

function packFor(text: string) {
  const extraction = extractFromText(text);
  const rules = runRules(extraction);
  return EvidencePack.parse({ now: new Date().toISOString(), extraction, ruleFindings: rules.findings, priorScore: rules.priorScore, floor: rules.floor, community: [], taxonomyIds: [], userLanguage: "en" as const });
}

describe("agent guards", () => {
  it("cannot lower a critical floor", () => {
    const pack = packFor("Send your PIN now.");
    const v = Verdict.parse({ risk: "safe", scamType: null, confidence: 0.2, reasons: [{ text: "Looks fine", ruleId: null, quote: null, severity: "low" }], nextSteps: ["Proceed"], needsMore: null, language: "en" });
    expect(enforceGuards(v, pack).risk).toBe("high");
  });
  it("rules-only verdict cites rule ids", () => {
    const v = rulesOnlyVerdict(packFor("Please reverse the money, tumetuma kimakosa. Do it within 30 minutes, tuma kwa hii number 0712345678."));
    expect(v.risk).toBe("high");
    expect(v.reasons.some((r) => r.ruleId === "R04")).toBe(true);
  });
});
