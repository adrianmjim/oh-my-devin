import { describe, expect, it } from 'vitest';
import type { Severity } from '../council/severity';
import type { TerminationDecision } from './termination-decision';
import type { TerminationInput } from './termination-input';
import type { TypedPosition } from './typed-position';
import { evaluateTermination } from './evaluate-termination';

const HIGH: Severity = 'high';

function blocker(seat: string, domain: string): TypedPosition {
  return {
    seat,
    lens: domain,
    kind: 'objection',
    domain,
    severity: 'high',
    concern: `${seat}-concern`,
    assumptions: [],
    reconsiderWhen: [],
  };
}

function input(overrides: Partial<TerminationInput>): TerminationInput {
  return {
    consented: false,
    blocking: [],
    previousBlocking: [],
    threshold: HIGH,
    round: 1,
    roundsCap: 3,
    wallTimeExceeded: false,
    ...overrides,
  };
}

describe('evaluateTermination', () => {
  it('closes as passed on consent', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({ consented: true }),
    );
    expect(decision).toEqual({ terminated: true, closure: 'passed' });
  });

  it('closes as blocked when the same objection stands unchanged across a round', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({
        round: 2,
        blocking: [blocker('sre', 'operability')],
        previousBlocking: [blocker('sre', 'operability')],
      }),
    );
    expect(decision).toEqual({ terminated: true, closure: 'blocked' });
  });

  it('does not close as blocked on the first round with no prior objection', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({ round: 1, blocking: [blocker('sre', 'operability')] }),
    );
    expect(decision.terminated).toBe(false);
  });

  it('continues when the standing objection changed since last round', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({
        round: 2,
        blocking: [blocker('security', 'threats')],
        previousBlocking: [blocker('sre', 'operability')],
      }),
    );
    expect(decision.terminated).toBe(false);
  });

  it('closes as bankrupt when the rounds cap is reached without consent', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({
        round: 3,
        roundsCap: 3,
        blocking: [blocker('security', 'threats')],
        previousBlocking: [blocker('sre', 'operability')],
      }),
    );
    expect(decision).toEqual({ terminated: true, closure: 'bankrupt' });
  });

  it('closes as bankrupt when the wall-time cap elapses', () => {
    const decision: TerminationDecision = evaluateTermination(
      input({ round: 2, wallTimeExceeded: true }),
    );
    expect(decision).toEqual({ terminated: true, closure: 'bankrupt' });
  });
});
