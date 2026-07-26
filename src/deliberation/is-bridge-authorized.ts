import type { DecisionRecord } from './decision-record';

export function isBridgeAuthorized(
  record: DecisionRecord,
  humanSigned: boolean,
): boolean {
  if (record.consent !== 'passed') {
    return false;
  }
  if (record.humanDecisionRequired) {
    return humanSigned;
  }
  return true;
}
