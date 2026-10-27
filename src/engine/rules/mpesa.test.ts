import { describe, expect, it } from "vitest";
import { findMpesaCodes, parseMpesaCode } from "./mpesa";

const NOW = new Date("2026-10-27T12:00:00Z");

describe("parseMpesaCode", () => {
  it("accepts the 2026-10-27 prefix UJR", () => {
    expect(parseMpesaCode("UJR7K2P9QX", NOW).ok).toBe(true);
  });
  it("rejects an impossible month letter", () => {
    expect(parseMpesaCode("UMR7K2P9QX", NOW).ok).toBe(false);
  });
  it("rejects a future date", () => {
    expect(parseMpesaCode("UJS7K2P9QX", NOW).ok).toBe(false);
  });
  it("finds codes in text", () => {
    expect(findMpesaCodes("Code UJR7K2P9QX confirmed")).toEqual(["UJR7K2P9QX"]);
  });
  it("does not treat a phone number as a code", () => {
    expect(findMpesaCodes("Call 0712345678")).toEqual([]);
  });
});
