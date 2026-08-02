import { deriveListingEntry } from './derive-listing-entry';
import { enumerateRunRecords } from './enumerate-run-records';
import type { RunId } from './run-id';
import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';
import { RUN_RECORD_SCAN_WINDOW_MS } from './run-record-scan-window-ms';
import { selectListingRuns } from './select-listing-runs';
import { TERMINATED_TAIL_CAP } from './terminated-tail-cap';
import { TERMINATED_TAIL_WINDOW_MS } from './terminated-tail-window-ms';

export async function deriveRunListing(
  baseDir: string,
  now: number,
  thresholdMs: number,
): Promise<RunListing> {
  const runIds: readonly RunId[] = await enumerateRunRecords(
    baseDir,
    now,
    RUN_RECORD_SCAN_WINDOW_MS,
  );
  const entries: RunListingEntry[] = [];
  for (const runId of runIds) {
    entries.push(await deriveListingEntry(baseDir, runId, now, thresholdMs));
  }
  return {
    runs: selectListingRuns(
      entries,
      now,
      TERMINATED_TAIL_WINDOW_MS,
      TERMINATED_TAIL_CAP,
    ),
  };
}
