import { describe, expect, it } from "vitest";
import { checkUrlShape } from "./url";

describe("checkUrlShape", () => {
  it("flags lookalike hosts", () => {
    const s = checkUrlShape("https://safaricom-bonus.xyz/claim");
    expect(s.suspicious).toBe(true);
    expect(s.reasons.join(" ")).toContain("lookalike");
  });
  it("flags shorteners", () => {
    expect(checkUrlShape("https://bit.ly/abc").reasons).toContain("shortener");
  });
  it("passes a normal official-shaped host", () => {
    expect(checkUrlShape("https://www.safaricom.co.ke").suspicious).toBe(false);
  });
});
