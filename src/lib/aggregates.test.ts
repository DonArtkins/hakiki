import { describe, expect, it } from "vitest";
import { checksPerDay, countByRisk, countByType, summary, type CheckRow } from "./aggregates";
const rows: CheckRow[] = [
  { id: "1", risk: "high", scamTypeId: "fake_reversal", language: "en", createdAt: "2026-10-27T10:00:00.000Z" },
  { id: "2", risk: "safe", scamTypeId: null, language: "sw", createdAt: "2026-10-27T11:00:00.000Z" },
  { id: "3", risk: "high", scamTypeId: "fake_reversal", language: "en", createdAt: "2026-10-26T11:00:00.000Z" },
];
describe("aggregates", () => {
  it("counts risk with zeroes", () => { expect(countByRisk(rows)).toEqual({ safe: 1, suspicious: 0, high: 2, unclear: 0 }); });
  it("groups per day sorted", () => { expect(checksPerDay(rows)).toEqual([{ day: "2026-10-26", count: 1 }, { day: "2026-10-27", count: 2 }]); });
  it("counts types", () => { expect(countByType(rows)[0]).toEqual({ type: "fake_reversal", count: 2 }); });
  it("summarises empty", () => { expect(summary([]).total).toBe(0); expect(summary([]).latest).toBeNull(); });
});
