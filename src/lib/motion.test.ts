import { describe, expect, it } from "vitest";
import { heroStepOrder, mixPercent, ringSpeed, shouldAnimate, staggerDelayMs, stageIntensity } from "./motion";

describe("motion", () => {
  it("stagger delay caps at 600ms", () => {
    expect(staggerDelayMs(0)).toBe(0);
    expect(staggerDelayMs(3)).toBe(180);
    expect(staggerDelayMs(99)).toBe(600);
  });
  it("hero order is promise proof action", () => {
    expect(heroStepOrder()).toEqual(["promise", "proof", "action"]);
  });
  it("stage intensity rises toward verdict", () => {
    expect(stageIntensity("idle")).toBe(0);
    expect(stageIntensity("verdict")).toBe(1);
    expect(stageIntensity("reasoning")).toBeGreaterThan(stageIntensity("rules"));
  });
  it("ring speed is zero with reduced motion", () => {
    expect(ringSpeed("verdict", true)).toBe(0);
    expect(ringSpeed("verdict", false)).toBeGreaterThan(0);
  });
  it("mix percent guards zero total", () => {
    expect(mixPercent(1, 0)).toBe(0);
    expect(mixPercent(1, 4)).toBe(25);
    expect(shouldAnimate(true)).toBe(false);
  });
});
