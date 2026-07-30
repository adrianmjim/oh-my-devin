import type { LivenessStamp } from './liveness-stamp';
import { loadRunSnapshot } from './load-run-snapshot';
import { readLivenessStamp } from './read-liveness-stamp';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import type { RunListingEntry } from './run-listing-entry';
import type { RunSnapshot } from './run-snapshot';

export async function deriveListingEntry(
  baseDir: string,
  runId: RunId,
  now: number,
  thresholdMs: number,
): Promise<RunListingEntry> {
  const snapshot: RunSnapshot = await loadRunSnapshot(
    baseDir,
    runId,
    now,
    thresholdMs,
  );
  const stamp: LivenessStamp | null = await readLivenessStamp(
    new RunRecordPaths(baseDir, runId).liveness,
  );
  const stateEnteredAt: number =
    snapshot.state === 'stalled' && stamp !== null
      ? stamp.stampedAt
      : snapshot.lastEventAt;
  return {
    runId: snapshot.runId,
    runKind: snapshot.runKind,
    state: snapshot.state,
    subject: snapshot.subject,
    currentStage: snapshot.currentStage,
    turnsUsed: snapshot.turnsUsed,
    maxTurns: snapshot.maxTurns,
    pendingGate: snapshot.pendingGate,
    failureTier: snapshot.failureTier,
    lastEventAt: snapshot.lastEventAt,
    stateEnteredAt,
  };
}
