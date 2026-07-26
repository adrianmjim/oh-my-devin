import { UsageError } from '../run/usage-error';
import { deriveSnapshot } from './derive-snapshot';
import { isValidRunId } from './is-valid-run-id';
import { launchingSnapshot } from './launching-snapshot';
import type { LivenessStamp } from './liveness-stamp';
import type { ProgressEvent } from './progress-event';
import { readJournal } from './read-journal';
import { readLivenessStamp } from './read-liveness-stamp';
import { recordDirMtime } from './record-dir-mtime';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import type { RunSnapshot } from './run-snapshot';

export async function loadRunSnapshot(
  baseDir: string,
  runId: RunId,
  now: number,
  thresholdMs: number,
): Promise<RunSnapshot> {
  if (!isValidRunId(runId)) {
    throw new UsageError(`unknown run "${runId}"`);
  }
  const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
  const events: readonly ProgressEvent[] | null = await readJournal(
    paths.journal,
  );
  if (events === null || events.length === 0) {
    const recordedAt: number | null = await recordDirMtime(paths.dir);
    if (recordedAt !== null) {
      return launchingSnapshot(runId, recordedAt, now, thresholdMs);
    }
    throw new UsageError(`unknown run "${runId}"`);
  }
  const stamp: LivenessStamp | null = await readLivenessStamp(paths.liveness);
  return deriveSnapshot(events, stamp?.stampedAt ?? null, now, thresholdMs);
}
