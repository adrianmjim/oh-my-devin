import type { Clock } from '../budget/clock';
import { JournalRunRecorder } from './journal-run-recorder';
import { JournalWriter } from './journal-writer';
import { LivenessRefresher } from './liveness-refresher';
import { LIVENESS_REFRESH_MS } from './liveness-timing';
import type { RunId } from './run-id';
import type { RunObserver } from './run-observer';
import { RunRecordPaths } from './run-record-paths';
import { systemIntervalScheduler } from './system-interval-scheduler';

export function createRunRecorder(
  baseDir: string,
  runId: RunId,
  clock: Clock,
): RunObserver {
  const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
  const journal: JournalWriter = new JournalWriter(paths.journal);
  const liveness: LivenessRefresher = new LivenessRefresher(
    paths.liveness,
    clock,
    LIVENESS_REFRESH_MS,
    systemIntervalScheduler,
  );
  return new JournalRunRecorder(journal, liveness);
}
