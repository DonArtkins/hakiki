import { EvidencePack, type Risk, type Verdict } from "./schemas";
import { guardInput, type CheckInput } from "./ingest";
import { extract, type RecordModelCall } from "./extract";
import { runRules } from "./rules";
import { groundQuotes, type Span } from "./ground";
import { runAgent } from "./agent";
import { TAXONOMY_IDS } from "./taxonomy";
import { hashIndicator, type IndicatorKind } from "./indicators";

export type { CheckInput } from "./ingest";
export { CheckInputError } from "./ingest";
export type { ModelCallRecord, RecordModelCall } from "./extract";

export interface CheckContext {
  subjectId?: string;
  deviceHash?: string;
  traceId: string;
  community?: EvidencePack["community"];
  indicatorPepper?: string;
  budgetTripped?: boolean;
  recordModelCall?: RecordModelCall;
}

export type CheckEvent =
  | { type: "stage"; stage: "extracting" | "rules" | "reasoning" }
  | { type: "rules"; findings: EvidencePack["ruleFindings"]; priorScore: number; floor: Risk | null; spans: Span[] }
  | { type: "verdict"; verdict: Verdict; spans: Span[]; usedModel: boolean }
  | { type: "done"; latencyMs: number }
  | { type: "error"; error: { code: string; message: string } };

// One engine, every channel (architecture rule 2): web SSE, Telegram, CLI and evals all call this.
export async function* runCheck(rawInput: CheckInput, ctx: CheckContext): AsyncIterable<CheckEvent> {
  const started = Date.now();
  try {
    const input = guardInput(rawInput);
    yield { type: "stage", stage: "extracting" };
    const extraction = await extract(input, ctx.recordModelCall);
    yield { type: "stage", stage: "rules" };
    const rules = runRules(extraction);
    const pack = EvidencePack.parse({
      now: new Date().toISOString(),
      extraction,
      ruleFindings: rules.findings,
      priorScore: rules.priorScore,
      floor: rules.floor,
      community: ctx.community ?? [],
      taxonomyIds: TAXONOMY_IDS,
      userLanguage: input.locale ?? (extraction.language === "sw" ? "sw" : extraction.language === "sheng" ? "sheng" : "en"),
    });
    yield {
      type: "rules",
      findings: rules.findings,
      priorScore: rules.priorScore,
      floor: rules.floor,
      spans: groundQuotes(extraction.text, rules.findings.map((f) => (f.span ? extraction.text.slice(f.span.start, f.span.end) : null))),
    };
    yield { type: "stage", stage: "reasoning" };
    const { verdict, usedModel } = await runAgent(pack, { recordModelCall: ctx.recordModelCall, budgetTripped: ctx.budgetTripped });
    yield { type: "verdict", verdict, spans: groundQuotes(extraction.text, verdict.reasons.map((r) => r.quote)), usedModel };
    yield { type: "done", latencyMs: Date.now() - started };
  } catch (err) {
    const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code?: unknown }).code ?? "internal") : "internal";
    yield { type: "error", error: { code, message: err instanceof Error ? err.message : "Check failed. Try again." } };
  }
}

export async function runCheckOnce(input: CheckInput, ctx: CheckContext): Promise<{ verdict: Verdict | null; events: CheckEvent[] }> {
  const events: CheckEvent[] = [];
  let verdict: Verdict | null = null;
  for await (const e of runCheck(input, ctx)) {
    events.push(e);
    if (e.type === "verdict") verdict = e.verdict;
  }
  return { verdict, events };
}

// Hashed indicators for the community layer: callers persist these, never the raw values.
export function indicatorHashesFor(input: { phones: string[]; urls: string[]; mpesaCodes: string[]; sender: string | null }, pepper: string): Array<{ kind: IndicatorKind; hash: string }> {
  const out: Array<{ kind: IndicatorKind; hash: string }> = [];
  for (const p of input.phones) out.push({ kind: "phone", hash: hashIndicator("phone", p, pepper) });
  for (const u of input.urls) out.push({ kind: "url_host", hash: hashIndicator("url_host", u, pepper) });
  for (const c of input.mpesaCodes) out.push({ kind: "mpesa_code_pattern", hash: hashIndicator("mpesa_code_pattern", c, pepper) });
  if (input.sender) out.push({ kind: "sender", hash: hashIndicator("sender", input.sender, pepper) });
  return out;
}
