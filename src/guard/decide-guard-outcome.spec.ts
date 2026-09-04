import { describe, expect, it } from 'vitest';
import { decideGuardOutcome } from './decide-guard-outcome';
import type { EnforcementLevel } from './enforcement-level';
import type { GuardDecisionInput } from './guard-decision-input';
import type { GuardOutcome } from './guard-outcome';
import { renderAskOutput } from './render-ask-output';
import { renderDenyOutput } from './render-deny-output';

function input(
  level: EnforcementLevel,
  outOfScope: boolean,
): GuardDecisionInput {
  return {
    level,
    outOfScope,
    tool: 'write',
    filePath: 'src/index.ts',
    reason: 'the contract',
    at: 42,
  };
}

describe('decideGuardOutcome', () => {
  it('decides nothing at off', () => {
    expect(decideGuardOutcome(input('off', true))).toBeNull();
    expect(decideGuardOutcome(input('off', false))).toBeNull();
  });

  it('allows a layer-path write at every enforcing level', () => {
    for (const level of ['warn', 'ask', 'strict'] as const) {
      const outcome: GuardOutcome | null = decideGuardOutcome(
        input(level, false),
      );

      expect(outcome).toEqual({
        decision: 'allowed',
        reason: '',
        output: {},
        notice: null,
      });
    }
  });

  it('lets the write land at warn and queues its notice', () => {
    const outcome: GuardOutcome | null = decideGuardOutcome(
      input('warn', true),
    );

    expect(outcome).toEqual({
      decision: 'warned',
      reason: 'the contract',
      output: {},
      notice: { tool: 'write', filePath: 'src/index.ts', noticedAt: 42 },
    });
  });

  it('downgrades the write to the confirmation at ask', () => {
    const outcome: GuardOutcome | null = decideGuardOutcome(input('ask', true));

    expect(outcome).toEqual({
      decision: 'asked',
      reason: 'the contract',
      output: renderAskOutput('the contract'),
      notice: null,
    });
  });

  it('blocks the write with the reason at strict', () => {
    const outcome: GuardOutcome | null = decideGuardOutcome(
      input('strict', true),
    );

    expect(outcome).toEqual({
      decision: 'blocked',
      reason: 'the contract',
      output: renderDenyOutput('the contract'),
      notice: null,
    });
  });

  it('queues a notice only for the warned write', () => {
    for (const level of ['ask', 'strict'] as const) {
      expect(decideGuardOutcome(input(level, true))?.notice).toBeNull();
    }
  });
});
