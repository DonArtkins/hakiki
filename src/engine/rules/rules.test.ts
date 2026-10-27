import { describe, expect, it } from "vitest";
import { extractFromText } from "../extract";
import { Extraction } from "../schemas";
import { hasGenuineSignals, runRules } from "./index";

describe("runRules", () => {
  it("floors a reversal script at high (F01-AC1)", () => {
    const ex = extractFromText("Confirmed. Ksh 15,000 sent to you by mistake. Please reverse it now, tuma kwa hii number 0712345678.");
    const r = runRules(ex);
    expect(r.findings.map((f) => f.id)).toContain("R04");
    expect(r.floor).toBe("high");
  });
  it("never makes a genuine-format confirmation high on rules alone (F01-AC2)", () => {
    const ex = Extraction.parse({
      kind: "sms", sender: "MPESA", claimsToBe: "M-Pesa",
      text: "UJR7K2P9QX Confirmed. Ksh 500.00 sent. New M-PESA balance is Ksh 2,340.00.",
      phones: [], urls: [], amounts: [{ value: 500, currency: "KES" }], mpesaCodes: ["UJR7K2P9QX"],
      hasBalanceLine: true, language: "en", legible: true,
    });
    const r = runRules(ex, new Date("2026-10-27T12:00:00Z"));
    expect(r.findings).toEqual([]);
    expect(hasGenuineSignals(ex, r.findings, new Date("2026-10-27T12:00:00Z"))).toBe(true);
  });
  it("treats a PIN request as critical", () => {
    const r = runRules(extractFromText("Send your PIN and OTP now to verify your account."));
    expect(r.findings.some((f) => f.id === "R10" && f.severity === "critical")).toBe(true);
    expect(r.floor).toBe("high");
  });
});
