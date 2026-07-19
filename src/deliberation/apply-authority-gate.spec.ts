import { describe, expect, it } from 'vitest';
import type { AuthorityPolicy } from '../council/authority-policy';
import type { AuthorityOutcome } from './authority-outcome';
import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import type { RecordedObjection } from './recorded-objection';
import { applyAuthorityGate } from './apply-authority-gate';

const DISSENT: readonly RecordedObjection[] = [
  {
    seat: 'sre',
    domain: 'operability',
    severity: 'medium',
    concern: 'coupling',
  },
];

function record(
  closure: ClosureState,
  authority: AuthorityPolicy,
): DecisionRecord {
  return {
    question: 'q',
    proposal: 'p',
    proposalSource: 'attached',
    consent: closure,
    authorityApplied: authority,
    supportingArguments: [],
    objections: DISSENT,
    assumptions: [],
    reconsiderWhen: [],
    humanDecisionRequired: closure !== 'passed' || authority === 'human',
  };
}

describe('applyAuthorityGate', () => {
  it('proceeds on a passed close under proceed authority', () => {
    const outcome: AuthorityOutcome = applyAuthorityGate(
      record('passed', 'proceed'),
    );
    expect(outcome.resolution).toBe('proceed');
    expect(outcome.dissent).toEqual(DISSENT);
  });

  it('escalates on a passed close under human authority', () => {
    expect(applyAuthorityGate(record('passed', 'human')).resolution).toBe(
      'escalate',
    );
  });

  it('escalates a blocked close regardless of proceed authority, dissent intact', () => {
    const outcome: AuthorityOutcome = applyAuthorityGate(
      record('blocked', 'proceed'),
    );
    expect(outcome.resolution).toBe('escalate');
    expect(outcome.dissent).toEqual(DISSENT);
  });

  it('escalates a bankrupt close', () => {
    expect(applyAuthorityGate(record('bankrupt', 'proceed')).resolution).toBe(
      'escalate',
    );
  });
});
