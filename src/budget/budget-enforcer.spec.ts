import { describe, expect, it } from 'vitest';
import type { Clock } from './clock';
import { BudgetEnforcer } from './budget-enforcer';

function fixedClock(readNow: () => number): Clock {
  return (): number => readNow();
}

describe('BudgetEnforcer', () => {
  it('counts every recorded turn against max_turns', () => {
    const budget = new BudgetEnforcer(
      3,
      null,
      fixedClock(() => 0),
    );

    expect(budget.turnsUsed).toBe(0);
    budget.recordTurn();
    budget.recordTurn();
    expect(budget.turnsUsed).toBe(2);
  });

  it('reports no turns remaining once the cap is reached', () => {
    const budget = new BudgetEnforcer(
      2,
      null,
      fixedClock(() => 0),
    );

    budget.recordTurn();
    expect(budget.hasTurnsRemaining()).toBe(true);
    budget.recordTurn();
    expect(budget.hasTurnsRemaining()).toBe(false);
    expect(budget.canProceed()).toBe(false);
  });

  it('exhausts on wall time when the elapsed time reaches the cap', () => {
    let now: number = 1000;
    const budget = new BudgetEnforcer(
      99,
      500,
      fixedClock(() => now),
    );

    expect(budget.isWallTimeExhausted()).toBe(false);
    expect(budget.canProceed()).toBe(true);
    now = 1500;
    expect(budget.isWallTimeExhausted()).toBe(true);
    expect(budget.canProceed()).toBe(false);
  });

  it('never exhausts on wall time when no cap is configured', () => {
    let now: number = 0;
    const budget = new BudgetEnforcer(
      99,
      null,
      fixedClock(() => now),
    );

    now = 10_000_000;
    expect(budget.isWallTimeExhausted()).toBe(false);
  });

  it('reports elapsed wall time from its clock', () => {
    let now: number = 1000;
    const budget = new BudgetEnforcer(
      1,
      null,
      fixedClock(() => now),
    );
    now = 1750;
    expect(budget.elapsedMs).toBe(750);
  });
});
