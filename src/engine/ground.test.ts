import { describe, expect, it } from "vitest";
import { groundQuotes } from "./ground";

describe("groundQuotes", () => {
  it("drops quotes that are not real substrings", () => {
    expect(groundQuotes("please reverse it now", ["reverse it", "send the PIN"])).toEqual([{ start: 7, end: 17, quote: "reverse it" }]);
  });
});
