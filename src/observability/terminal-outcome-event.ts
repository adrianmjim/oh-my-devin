import type { FailureTier } from '../outcome/failure-tier';

export interface TerminalOutcomeEvent {
  readonly type: 'terminalOutcome';
  readonly timestamp: number;
  readonly succeeded: boolean;
  readonly failureTier: FailureTier | null;
}
