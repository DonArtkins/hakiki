import { describe, expect, it } from "vitest";
import { communityVisible, hashIndicator } from "./indicators";

describe("indicators", () => {
  it("hashes are stable and normalised", () => {
    expect(hashIndicator("phone", "0712345678", "pepper-test")).toBe(hashIndicator("phone", "+254712345678", "pepper-test"));
  });
  it("community counts need 3 reports and 2 devices (F06-AC1)", () => {
    expect(communityVisible({ reports: 3, devices: 1 })).toBe(false);
    expect(communityVisible({ reports: 3, devices: 2 })).toBe(true);
    expect(communityVisible({ reports: 2, devices: 5 })).toBe(false);
  });
});
