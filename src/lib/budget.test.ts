import { describe, expect, it } from "vitest";
import { assertBudget, BudgetExhaustedError, budgetTripped } from "./budget";

describe("budget", () => {
  it("trips at the daily cap (F01-AC5)", () => {
    const s = { spentTodayUsd: 6, spentTotalUsd: 10, dailyCapUsd: 6, totalCapUsd: 40 };
    expect(budgetTripped(s)).toBe(true);
    expect(() => assertBudget(s)).toThrow(BudgetExhaustedError);
  });
});
