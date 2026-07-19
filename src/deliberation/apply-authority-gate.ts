import type { AuthorityOutcome } from './authority-outcome';
import type { DecisionRecord } from './decision-record';

export function applyAuthorityGate(record: DecisionRecord): AuthorityOutcome {
  return {
    resolution: record.humanDecisionRequired ? 'escalate' : 'proceed',
    dissent: record.objections,
  };
}
