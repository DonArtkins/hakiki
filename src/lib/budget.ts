// Budget is a feature (SDR-006/R5): every model call is priced, and the cap degrades
// the product to rules-only verdicts instead of spending silently.
export class BudgetExhaustedError extends Error {
  readonly code = "budget_exhausted";
  constructor(message = "Daily model budget reached; rules-only checks still work.") {
    super(message);
    this.name = "BudgetExhaustedError";
  }
}

export interface BudgetState {
  spentTodayUsd: number;
  spentTotalUsd: number;
  dailyCapUsd: number;
  totalCapUsd: number;
}

export function assertBudget(s: BudgetState): void {
  if (s.spentTodayUsd >= s.dailyCapUsd || s.spentTotalUsd >= s.totalCapUsd) {
    throw new BudgetExhaustedError();
  }
}

export function budgetTripped(s: BudgetState): boolean {
  return s.spentTodayUsd >= s.dailyCapUsd || s.spentTotalUsd >= s.totalCapUsd;
}
