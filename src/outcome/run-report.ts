import type { FailureTier } from './failure-tier';

export interface RunReport {
  readonly role: string;
  readonly task: string;
  readonly engine: string;
  readonly sessionId: string | null;
  readonly failureTier: FailureTier | null;
  readonly turnsUsed: number;
  readonly maxTurns: number;
  readonly wallTimeMs: number | null;
  readonly artifactPath: string;
  readonly artifactValid: boolean;
  readonly validationErrors: readonly string[];
  readonly denyRule: string | null;
  readonly repairAttempted: boolean;
}
