import { describe, expect, it } from "vitest";
import { redact } from "./redact";

describe("redact", () => {
  it("masks Kenyan phone numbers", () => {
    expect(redact("Call 0712345678 now")).not.toContain("0712345678");
  });
  it("masks emails", () => {
    expect(redact("Write to a@example.com")).toBe("Write to ***@***");
  });
});
