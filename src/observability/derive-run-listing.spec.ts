import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveRunListing } from './derive-run-listing';
import { JournalWriter } from './journal-writer';
import type { ProgressEvent } from './progress-event';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';
import { TERMINATED_TAIL_WINDOW_MS } from './terminated-tail-window-ms';
import { writeLivenessStamp } from './write-liveness-stamp';

const THRESHOLD_MS: number = 120000;

describe('deriveRunListing', () => {
  let baseDir: string;
  let now: number;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-run-listing-'));
    now = Date.now();
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function seed(
    runId: RunId,
    events: readonly ProgressEvent[],
    stampedAt: number | null,
  ): Promise<void> {
    const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
    await mkdir(paths.dir, { recursive: true });
    const writer: JournalWriter = new JournalWriter(paths.journal);
    for (const event of events) {
      await writer.append(event);
    }
    if (stampedAt !== null) {
      await writeLivenessStamp(paths.liveness, stampedAt);
    }
  }

  function launched(runId: RunId, timestamp: number): ProgressEvent {
    return {
      type: 'runLaunched',
      timestamp,
      runId,
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: 'review.json',
    };
  }

  function identities(listing: RunListing): readonly RunId[] {
    return listing.runs.map((entry: RunListingEntry): RunId => entry.runId);
  }

  it('lists the project runs most recent first with their derived states', async () => {
    await seed('run-live', [launched('run-live', now - 1000)], now);
    await seed(
      'run-cold',
      [launched('run-cold', now - 5000)],
      now - THRESHOLD_MS * 2,
    );

    const listing: RunListing = await deriveRunListing(
      baseDir,
      now,
      THRESHOLD_MS,
    );

    expect(identities(listing)).toEqual(['run-live', 'run-cold']);
    expect(listing.runs[0]?.state).toBe('running');
    expect(listing.runs[1]?.state).toBe('stalled');
  });

  it('drops terminated runs older than the recency window', async () => {
    const terminatedAt: number = now - TERMINATED_TAIL_WINDOW_MS * 2;
    await seed('run-live', [launched('run-live', now - 1000)], now);
    await seed(
      'run-ancient',
      [
        launched('run-ancient', terminatedAt - 1000),
        {
          type: 'terminalOutcome',
          timestamp: terminatedAt,
          succeeded: true,
          failureTier: null,
        },
      ],
      terminatedAt,
    );

    const listing: RunListing = await deriveRunListing(
      baseDir,
      now,
      THRESHOLD_MS,
    );

    expect(identities(listing)).toEqual(['run-live']);
  });

  it('keeps a recently terminated run with its outcome', async () => {
    await seed(
      'run-failed',
      [
        launched('run-failed', now - 3000),
        {
          type: 'terminalOutcome',
          timestamp: now - 2000,
          succeeded: false,
          failureTier: 'invalid_artifact',
        },
      ],
      now - 2000,
    );

    const listing: RunListing = await deriveRunListing(
      baseDir,
      now,
      THRESHOLD_MS,
    );

    expect(listing.runs[0]?.state).toBe('failed');
    expect(listing.runs[0]?.failureTier).toBe('invalid_artifact');
  });

  it('is empty in a project with no recorded runs', async () => {
    const listing: RunListing = await deriveRunListing(
      baseDir,
      now,
      THRESHOLD_MS,
    );

    expect(listing).toEqual({ runs: [] });
  });
});
