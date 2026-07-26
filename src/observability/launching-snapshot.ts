import { deriveLiveness } from './derive-liveness';
import type { Liveness } from './liveness';
import type { RunId } from './run-id';
import type { RunSnapshot } from './run-snapshot';

export function launchingSnapshot(
  runId: RunId,
  recordedAt: number,
  now: number,
  thresholdMs: number,
): RunSnapshot {
  const liveness: Liveness = deriveLiveness(recordedAt, now, thresholdMs);
  return {
    runId,
    runKind: 'single-role',
    state: liveness === 'stalled' ? 'stalled' : 'running',
    subject: '',
    currentStage: null,
    turnsUsed: 0,
    maxTurns: 0,
    artifactPath: null,
    artifactValid: null,
    pendingGate: null,
    failureTier: null,
    lastEventAt: recordedAt,
  };
}
