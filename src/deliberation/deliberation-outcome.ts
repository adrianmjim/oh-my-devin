import type { AuthorityOutcome } from './authority-outcome';
import type { BridgeResult } from './bridge-result';
import type { DecisionRecord } from './decision-record';

export interface DeliberationOutcome {
  readonly record: DecisionRecord;
  readonly authority: AuthorityOutcome;
  readonly bridge: BridgeResult;
}
