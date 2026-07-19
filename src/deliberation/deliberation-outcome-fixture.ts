import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import type { DeliberationOutcome } from './deliberation-outcome';
import type { GateResolution } from './gate-resolution';

export function deliberationOutcome(
  closure: ClosureState,
  resolution: GateResolution,
  bridgeLaunched: boolean,
): DeliberationOutcome {
  const record: DecisionRecord = {
    question: 'should we ship?',
    proposal: 'ship behind a flag',
    proposalSource: 'attached',
    consent: closure,
    authorityApplied: 'human',
    supportingArguments: [{ id: 'a1', claim: 'safe', endorsements: 2 }],
    objections: [
      { seat: 'security', domain: 'auth', severity: 'high', concern: 'leak' },
    ],
    assumptions: [],
    reconsiderWhen: [],
    humanDecisionRequired: resolution === 'escalate',
  };
  return {
    record,
    authority: {
      resolution,
      dissent: resolution === 'escalate' ? record.objections : [],
    },
    bridge: { launched: bridgeLaunched, pipeline: null },
    utilityTurns: 3,
  };
}
