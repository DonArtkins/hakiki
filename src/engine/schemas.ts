import { z } from "zod";

// Zod schemas are the contract (docs/09 section 1). JSON Schema for Meta is derived from these;
// nesting stays shallow and non-recursive (provider limit).
export const Language = z.enum(["en", "sw", "sheng", "mixed", "other"]);
export const OutputLanguage = z.enum(["en", "sw", "sheng"]);
export const Risk = z.enum(["safe", "suspicious", "high", "unclear"]);
export type Risk = z.infer<typeof Risk>;

export const Extraction = z.object({
  kind: z.enum(["sms", "whatsapp", "email", "payment_screenshot", "social_post", "web_page", "other"]),
  sender: z.string().nullable(),
  claimsToBe: z.string().nullable(),
  text: z.string(),
  phones: z.array(z.string()),
  urls: z.array(z.string()),
  amounts: z.array(z.object({ value: z.number(), currency: z.string() })),
  mpesaCodes: z.array(z.string()),
  hasBalanceLine: z.boolean().nullable(),
  language: Language,
  legible: z.boolean(),
});
export type Extraction = z.infer<typeof Extraction>;

export const Severity = z.enum(["low", "medium", "high", "critical"]);
export type Severity = z.infer<typeof Severity>;

export const RuleFinding = z.object({
  id: z.string(),
  severity: Severity,
  weight: z.number().int().min(0).max(100),
  evidence: z.string().max(200),
  span: z.object({ start: z.number().int(), end: z.number().int() }).nullable(),
});
export type RuleFinding = z.infer<typeof RuleFinding>;

export const VerdictReason = z.object({
  text: z.string().max(160),
  ruleId: z.string().nullable(),
  quote: z.string().max(80).nullable(),
  severity: Severity,
});

export const Verdict = z.object({
  risk: Risk,
  scamType: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reasons: z.array(VerdictReason).min(1).max(6),
  nextSteps: z.array(z.string().max(140)).min(1).max(5),
  needsMore: z.string().nullable(),
  language: OutputLanguage,
});
export type Verdict = z.infer<typeof Verdict>;

export const EvidencePack = z.object({
  now: z.string(),
  extraction: Extraction,
  ruleFindings: z.array(RuleFinding),
  priorScore: z.number().int().min(0).max(100),
  floor: Risk.nullable(),
  community: z.array(z.object({
    kind: z.string(), reports: z.number().int(), devices: z.number().int(), windowDays: z.number().int(),
  })),
  taxonomyIds: z.array(z.string()),
  userLanguage: OutputLanguage,
});
export type EvidencePack = z.infer<typeof EvidencePack>;
