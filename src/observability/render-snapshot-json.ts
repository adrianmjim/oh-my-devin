import type { JsonRunSnapshot } from './json-run-snapshot';
import type { RunSnapshot } from './run-snapshot';

export function renderSnapshotJson(snapshot: RunSnapshot): JsonRunSnapshot {
  return {
    runId: snapshot.runId,
    runKind: snapshot.runKind,
    state: snapshot.state,
    subject: snapshot.subject,
    currentStage: snapshot.currentStage,
    turnsUsed: snapshot.turnsUsed,
    maxTurns: snapshot.maxTurns,
    artifactPath: snapshot.artifactPath,
    artifactValid: snapshot.artifactValid,
    pendingGate: snapshot.pendingGate,
    failureTier: snapshot.failureTier,
    lastEventAt: snapshot.lastEventAt,
  };
}
