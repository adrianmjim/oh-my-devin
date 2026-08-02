import { applyProgressEvent } from './apply-progress-event';
import { deriveRunState } from './derive-run-state';
import { initialSnapshotAccumulator } from './initial-snapshot-accumulator';
import type { ProgressEvent } from './progress-event';
import type { RunSnapshot } from './run-snapshot';
import type { RunState } from './run-state';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function deriveSnapshot(
  events: readonly ProgressEvent[],
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): RunSnapshot {
  const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();
  for (const event of events) {
    applyProgressEvent(accumulator, event);
  }
  const state: RunState = deriveRunState(
    accumulator,
    stampedAt,
    now,
    thresholdMs,
  );
  const stateEnteredAt: number =
    state === 'stalled'
      ? (stampedAt ?? accumulator.lastEventAt) + thresholdMs
      : accumulator.stateEnteredAt;
  return {
    runId: accumulator.runId,
    runKind: accumulator.runKind,
    state,
    subject: accumulator.subject,
    currentStage: accumulator.currentStage,
    turnsUsed: accumulator.turnsUsed,
    maxTurns: accumulator.maxTurns,
    artifactPath: accumulator.artifactPath,
    artifactValid: accumulator.artifactValid,
    pendingGate: accumulator.pendingGate,
    failureTier: accumulator.failureTier,
    lastEventAt: accumulator.lastEventAt,
    stateEnteredAt,
  };
}
