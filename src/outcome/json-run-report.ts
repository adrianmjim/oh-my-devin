import type { RunId } from '../observability/run-id';
import type { FailureTier } from './failure-tier';
import type { RunOutcome } from './run-outcome';

export interface JsonRunReport {
  readonly runId: RunId;
  readonly role: string;
  readonly task: string;
  readonly engine: string;
  readonly sessionId: string | null;
  readonly outcome: RunOutcome;
  readonly failureTier: FailureTier | null;
  readonly exitCode: number;
  readonly turnsUsed: number;
  readonly maxTurns: number;
  readonly wallTimeMs: number | null;
  readonly artifactPath: string;
  readonly artifactValid: boolean;
  readonly validationErrors: readonly string[];
  readonly denyRule: string | null;
  readonly repairAttempted: boolean;
}
