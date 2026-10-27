import type { Risk } from "@/engine/schemas";
export type MachineStage = "idle" | "extracting" | "rules" | "reasoning" | "verdict" | "error";
export interface MachineState { stage: MachineStage; risk: Risk | null }
export const IDLE_MACHINE: MachineState = { stage: "idle", risk: null };
