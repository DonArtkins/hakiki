import { describe, expect, it } from "vitest";
import { typeName } from "./HistoryTable";

describe("typeName", () => {
  it("labels checks without a scam type as no scam type, not none yet", () => {
    expect(typeName(null, "en")).toBe("No scam type");
    expect(typeName(null, "sw")).toBe("Hakuna aina ya utapeli");
    expect(typeName("unknown", "en")).toBe("No scam type");
  });
  it("names known scam types", () => {
    expect(typeName("fake_reversal", "en")).not.toBe("No scam type");
    expect(typeName("fake_reversal", "en")).not.toBe("None yet");
  });
});
