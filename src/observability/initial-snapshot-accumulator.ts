import type { SnapshotAccumulator } from './snapshot-accumulator';

export function initialSnapshotAccumulator(): SnapshotAccumulator {
  return {
    runId: '',
    runKind: 'single-role',
    subject: '',
    maxTurns: 0,
    turnsUsed: 0,
    currentStage: null,
    artifactPath: null,
    artifactValid: null,
    pendingGate: null,
    succeeded: null,
    failureTier: null,
    lastEventAt: 0,
  };
}
