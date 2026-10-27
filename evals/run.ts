import { readFile, writeFile } from "node:fs/promises";
import { runCheckOnce } from "../src/engine";
import { extractFromText } from "../src/engine/extract";
import { runRules } from "../src/engine/rules";
import { rulesOnlyVerdict } from "../src/engine/agent";
import { EvidencePack } from "../src/engine/schemas";

// Eval modes: rules (free, default), full (engine incl. model if configured), llm-only (same
// engine without rule floors is NOT supported by design; it reports full for comparison only).
interface EvalCase {
  id: string;
  input: { text?: string };
  label: { risk: string; scam_type: string | null; benign: boolean };
  locale: string;
}

async function main() {
  const modeArg = process.argv.find((a) => a.startsWith("--mode="))?.split("=")[1]
    ?? (process.argv.includes("--mode") ? process.argv[process.argv.indexOf("--mode") + 1] : "rules");
  const mode = modeArg === "full" || modeArg === "llm-only" ? "full" : "rules";
  const raw = await readFile(new URL("./cases.jsonl", import.meta.url), "utf8");
  const cases = raw.split("\n").filter(Boolean).map((l) => JSON.parse(l) as EvalCase);
  let riskCorrect = 0;
  let typeCorrect = 0;
  let benignFalseHigh = 0;
  const rows: string[] = [];
  for (const c of cases) {
    const started = Date.now();
    let predictedRisk = "unclear";
    let predictedType: string | null = null;
    if (mode === "rules") {
      const extraction = extractFromText(c.input.text ?? "");
      const rules = runRules(extraction);
      const pack = EvidencePack.parse({ now: new Date().toISOString(), extraction, ruleFindings: rules.findings, priorScore: rules.priorScore, floor: rules.floor, community: [], taxonomyIds: [], userLanguage: c.locale === "sw" ? "sw" : "en" });
      const verdict = rulesOnlyVerdict(pack);
      predictedRisk = verdict.risk;
      predictedType = verdict.scamType;
    } else {
      const { verdict } = await runCheckOnce({ text: c.input.text, channel: "eval", locale: c.locale === "sw" ? "sw" : "en" }, { traceId: `eval-${c.id}` });
      predictedRisk = verdict?.risk ?? "unclear";
      predictedType = verdict?.scamType ?? null;
    }
    const expectedScam = !c.label.benign;
    const riskOk = expectedScam ? predictedRisk === "high" || predictedRisk === "suspicious" : predictedRisk !== "high";
    if (riskOk) riskCorrect++;
    if (expectedScam && predictedType === c.label.scam_type) typeCorrect++;
    if (c.label.benign && predictedRisk === "high") benignFalseHigh++;
    rows.push(`| ${c.id} | ${c.label.risk} | ${predictedRisk} | ${c.label.scam_type ?? "-"} | ${predictedType ?? "-"} | ${riskOk ? "yes" : "no"} | ${Date.now() - started} |`);
  }
  const scamCount = cases.filter((c) => !c.label.benign).length;
  const benignCount = cases.length - scamCount;
  const report = `# Eval report\n\nMode: ${mode}. Cases: ${cases.length} (seed set; F08 grows this to 60+ with a held-out split).\n\n| Case | Expected | Predicted | Expected type | Predicted type | Risk ok | ms |\n|---|---|---|---|---|---|---|\n${rows.join("\n")}\n\n- Scam risk recall (high/suspicious): ${(riskCorrect / Math.max(1, cases.length) * 100).toFixed(1)}% overall risk agreement\n- Type accuracy on scams: ${(typeCorrect / Math.max(1, scamCount) * 100).toFixed(1)}%\n- Benign false-high: ${benignFalseHigh}/${benignCount}\n`;
  await writeFile(new URL("./report.md", import.meta.url), report);
  console.log(report);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : "eval failed");
  process.exit(1);
});
