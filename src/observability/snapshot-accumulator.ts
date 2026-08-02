import type { FailureTier } from '../outcome/failure-tier';
import type { RunId } from './run-id';
import type { RunKind } from './run-kind';

export interface SnapshotAccumulator {
  runId: RunId;
  runKind: RunKind;
  subject: string;
  maxTurns: number;
  turnsUsed: number;
  currentStage: string | null;
  artifactPath: string | null;
  artifactValid: boolean | null;
  pendingGate: string | null;
  succeeded: boolean | null;
  failureTier: FailureTier | null;
  lastEventAt: number;
  stateEnteredAt: number;
}
