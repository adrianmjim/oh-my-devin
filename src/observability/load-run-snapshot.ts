import { stat } from 'node:fs/promises';
import { UsageError } from '../run/usage-error';
import { deriveSnapshot } from './derive-snapshot';
import type { LivenessStamp } from './liveness-stamp';
import type { ProgressEvent } from './progress-event';
import { readJournal } from './read-journal';
import { readLivenessStamp } from './read-liveness-stamp';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import type { RunSnapshot } from './run-snapshot';

export async function loadRunSnapshot(
  baseDir: string,
  runId: RunId,
  now: number,
  thresholdMs: number,
): Promise<RunSnapshot> {
  const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
  const events: readonly ProgressEvent[] | null = await readJournal(
    paths.journal,
  );
  if (events === null || events.length === 0) {
    if (await directoryExists(paths.dir)) {
      return launchingSnapshot(runId, now);
    }
    throw new UsageError(`unknown run "${runId}"`);
  }
  const stamp: LivenessStamp | null = await readLivenessStamp(paths.liveness);
  return deriveSnapshot(events, stamp?.stampedAt ?? null, now, thresholdMs);
}

async function directoryExists(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

function launchingSnapshot(runId: RunId, now: number): RunSnapshot {
  return {
    runId,
    runKind: 'single-role',
    state: 'running',
    subject: '',
    currentStage: null,
    turnsUsed: 0,
    maxTurns: 0,
    artifactPath: null,
    artifactValid: null,
    pendingGate: null,
    failureTier: null,
    lastEventAt: now,
  };
}
