"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckForm } from "./CheckForm";
import { HistoryTable } from "./HistoryTable";
import { StageStepper } from "./ui";
import { IDLE_MACHINE, type MachineState } from "./machine-state";
import type { CheckRow } from "@/lib/aggregates";
import { SAMPLES } from "@/lib/samples";
import { t } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

const MachineCanvas = dynamic(() => import("./MachineCanvas").then((m) => m.MachineCanvas), { ssr: false });

export function Studio() {
  const { locale } = useLocale();
  const params = useSearchParams();
  const sample = SAMPLES.find((s) => s.id === params.get("sample"));
  const [machine, setMachine] = useState<MachineState>(IDLE_MACHINE);
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const load = useCallback(async () => {
    try { const res = await fetch("/api/checks"); if (!res.ok) throw new Error("bad"); const data = (await res.json()) as { checks?: CheckRow[] }; setRows(data.checks ?? []); setLoadFailed(false); } catch { setLoadFailed(true); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const onMachine = useCallback((s: MachineState) => setMachine(s), []);
  const stageLabel = machine.stage === "idle" ? t(locale, "studio.machineIdle") : machine.stage === "verdict" ? t(locale, "studio.machineDone") : machine.stage === "error" ? t(locale, "studio.machineError") : t(locale, `stage.${machine.stage}`);
  const steps = (["extracting", "rules", "reasoning"] as const).map((s, i) => ({
    label: t(locale, `stage.${s}`),
    state: machine.stage === "verdict" ? "done" as const : machine.stage === s ? "active" as const : (["extracting", "rules", "reasoning"].indexOf(machine.stage) > i ? "done" as const : "pending" as const),
    stateLabel: machine.stage === "verdict" ? t(locale, "stage.done") : machine.stage === s ? t(locale, "stage.active") : t(locale, "stage.pending"),
  }));
  return (
    <div>
      <h1 className="display page-title">{t(locale, "studio.title")}</h1>
      <p className="muted-lede">{t(locale, "studio.intro")}</p>
      <div className="studio-grid">
        <div className="studio-left">
          <CheckForm variant="studio" initialText={sample?.text ?? ""} onMachineState={onMachine} onDone={() => void load()} />
          <section className="card history-panel">
            <h2 className="eyebrow">{t(locale, "studio.history")}</h2>
            {loadFailed ? <p role="alert" style={{ margin: 0 }}>{t(locale, "dash.loadFailed")}</p> : <HistoryTable rows={rows} locale={locale} compact />}
          </section>
        </div>
        <aside className="machine-panel card" aria-label={t(locale, "studio.machine")}>
          <h2 className="eyebrow">{t(locale, "studio.machine")}</h2>
          <MachineCanvas state={machine} label={`${t(locale, "studio.machine")}: ${stageLabel}`} fallback={<div className="machine-fallback"><StageStepper steps={steps} /></div>} />
          <p role="status" className="machine-status">{stageLabel}</p>
          <div className="machine-stepper"><StageStepper steps={steps} /></div>
        </aside>
      </div>
    </div>
  );
}
