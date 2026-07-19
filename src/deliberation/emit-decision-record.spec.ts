import { describe, expect, it } from 'vitest';
import type { AuthorityPolicy } from '../council/authority-policy';
import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import type { EchoCluster } from './echo-cluster';
import type { RecordInput } from './record-input';
import type { TypedPosition } from './typed-position';
import { emitDecisionRecord } from './emit-decision-record';

const SUPPORTING: readonly EchoCluster[] = [
  {
    id: 'faster_initial_delivery',
    claim: 'faster_initial_delivery',
    endorsements: 3,
    seats: ['architect', 'developer', 'pm'],
  },
];

const NON_BLOCKING: TypedPosition = {
  seat: 'sre',
  lens: 'operability',
  kind: 'objection',
  domain: 'operability',
  severity: 'medium',
  concern: 'deployment_coupling',
};

function input(
  closure: ClosureState,
  authority: AuthorityPolicy,
  objections: readonly TypedPosition[],
): RecordInput {
  return {
    question: 'service-decomposition',
    proposal: 'modular-monolith',
    proposalSource: 'attached',
    closure,
    authority,
    supporting: SUPPORTING,
    objections,
    assumptions: ['expected_users_below_10000'],
    reconsiderWhen: ['independent_scaling_is_required'],
  };
}

describe('emitDecisionRecord', () => {
  it('carries the full field set as a JSON-serializable record', () => {
    const record: DecisionRecord = emitDecisionRecord(
      input('passed', 'human', [NON_BLOCKING]),
    );

    expect(record.question).toBe('service-decomposition');
    expect(record.proposal).toBe('modular-monolith');
    expect(record.proposalSource).toBe('attached');
    expect(record.consent).toBe('passed');
    expect(record.authorityApplied).toBe('human');
    expect(record.supportingArguments[0]?.endorsements).toBe(3);
    expect(record.assumptions).toEqual(['expected_users_below_10000']);
    expect(record.reconsiderWhen).toEqual(['independent_scaling_is_required']);
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
  });

  it('records a non-blocking objection in the ledger with its full detail', () => {
    const record: DecisionRecord = emitDecisionRecord(
      input('passed', 'proceed', [NON_BLOCKING]),
    );

    expect(record.objections).toEqual([
      {
        seat: 'sre',
        domain: 'operability',
        severity: 'medium',
        concern: 'deployment_coupling',
      },
    ]);
  });

  it('marks human_decision_required true on a blocked close', () => {
    const record: DecisionRecord = emitDecisionRecord(
      input('blocked', 'proceed', [NON_BLOCKING]),
    );
    expect(record.humanDecisionRequired).toBe(true);
  });

  it('marks human_decision_required true on a passed close under human authority', () => {
    const record: DecisionRecord = emitDecisionRecord(
      input('passed', 'human', []),
    );
    expect(record.humanDecisionRequired).toBe(true);
  });

  it('marks human_decision_required false only on a passed close under proceed', () => {
    const record: DecisionRecord = emitDecisionRecord(
      input('passed', 'proceed', []),
    );
    expect(record.humanDecisionRequired).toBe(false);
  });
});
