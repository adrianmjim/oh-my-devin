import type { GuardDecision } from './guard-decision';
import type { PendingNotice } from './pending-notice';

export interface GuardOutcome {
  readonly decision: GuardDecision;
  readonly reason: string;
  readonly output: Record<string, unknown>;
  readonly notice: PendingNotice | null;
}
