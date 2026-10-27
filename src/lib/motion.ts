// Pure motion choreography (no DOM, no GSAP import) so timings stay testable.
// Runtime GSAP wiring lives in src/lib/use-reveal.ts and calls these values.

export const MOTION = {
  fastMs: 150,
  mediumMs: 250,
  staggerStepMs: 60,
  staggerCapMs: 600,
  heroWordMs: 520,
  sectionRisePx: 18,
} as const;

export function staggerDelayMs(index: number): number {
  if (index <= 0) return 0;
  return Math.min(index * MOTION.staggerStepMs, MOTION.staggerCapMs);
}

export function heroStepOrder(): string[] {
  return ["promise", "proof", "action"];
}

export type MachineStageName = "idle" | "extracting" | "rules" | "reasoning" | "verdict" | "error";

export function stageIntensity(stage: MachineStageName): number {
  switch (stage) {
    case "extracting": return 0.35;
    case "rules": return 0.6;
    case "reasoning": return 0.85;
    case "verdict": return 1;
    case "error": return 0.2;
    default: return 0;
  }
}

export function ringSpeed(stage: MachineStageName, prefersReduced: boolean): number {
  if (prefersReduced) return 0;
  return stageIntensity(stage) * 0.012;
}

export function shouldAnimate(prefersReduced: boolean): boolean {
  return !prefersReduced;
}

export function mixPercent(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}
