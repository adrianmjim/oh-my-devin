import { describe, expect, it } from 'vitest';
import type { OutcomeSignals } from './outcome-signals';
import { classifyOutcome } from './classify-outcome';

function signals(overrides: Partial<OutcomeSignals>): OutcomeSignals {
  return {
    denyHit: false,
    artifactValid: false,
    repairAttempted: false,
    budgetExhausted: false,
    ...overrides,
  };
}

describe('classifyOutcome', () => {
  it('returns success when the artifact is valid', () => {
    expect(classifyOutcome(signals({ artifactValid: true }))).toBeNull();
  });

  it('classifies a deny hit as tier 1, outranking everything', () => {
    expect(
      classifyOutcome(
        signals({
          denyHit: true,
          budgetExhausted: true,
          repairAttempted: true,
        }),
      ),
    ).toBe('deny');
  });

  it('classifies a failed repair as tier 2 even when it also exhausts the budget', () => {
    expect(
      classifyOutcome(
        signals({ repairAttempted: true, budgetExhausted: true }),
      ),
    ).toBe('invalid_artifact');
  });

  it('classifies a budget-foreclosed run (no repair) as tier 3', () => {
    expect(
      classifyOutcome(
        signals({ repairAttempted: false, budgetExhausted: true }),
      ),
    ).toBe('budget');
  });

  it('classifies a completed-but-invalid run as tier 2 by default', () => {
    expect(classifyOutcome(signals({ repairAttempted: true }))).toBe(
      'invalid_artifact',
    );
  });
});
