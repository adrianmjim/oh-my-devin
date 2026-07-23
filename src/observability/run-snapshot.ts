import type { FailureTier } from '../outcome/failure-tier';
import type { RunId } from './run-id';
import type { RunKind } from './run-kind';
import type { RunState } from './run-state';

export interface RunSnapshot {
  readonly runId: RunId;
  readonly runKind: RunKind;
  readonly state: RunState;
  readonly subject: string;
  readonly currentStage: string | null;
  readonly turnsUsed: number;
  readonly maxTurns: number;
  readonly artifactPath: string | null;
  readonly artifactValid: boolean | null;
  readonly pendingGate: string | null;
  readonly failureTier: FailureTier | null;
  readonly lastEventAt: number;
}
