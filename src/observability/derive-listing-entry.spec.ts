import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveListingEntry } from './derive-listing-entry';
import { JournalWriter } from './journal-writer';
import type { ProgressEvent } from './progress-event';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import type { RunListingEntry } from './run-listing-entry';
import { writeLivenessStamp } from './write-liveness-stamp';

const THRESHOLD_MS: number = 120000;
const NOW: number = 10000000;

function launched(runId: RunId): ProgressEvent {
  return {
    type: 'runLaunched',
    timestamp: 1000,
    runId,
    runKind: 'single-role',
    subject: 'reviewer',
    maxTurns: 8,
    artifactPath: 'review.json',
  };
}

describe('deriveListingEntry', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-listing-entry-'));
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

  it('maps a live run onto its identity, subject and turn usage', async () => {
    await seed(
      'run-live',
      [
        launched('run-live'),
        {
          type: 'turnCompleted',
          timestamp: 2000,
          turnIndex: 1,
          boundary: 'launch',
        },
      ],
      NOW,
    );

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-live',
      NOW,
      THRESHOLD_MS,
    );

    expect(entry.runId).toBe('run-live');
    expect(entry.runKind).toBe('single-role');
    expect(entry.state).toBe('running');
    expect(entry.subject).toBe('reviewer');
    expect(entry.turnsUsed).toBe(2);
    expect(entry.maxTurns).toBe(8);
    expect(entry.lastEventAt).toBe(2000);
    expect(entry.stateEnteredAt).toBe(2000);
  });

  it('applies the stalled derivation and dates the state from the liveness signal', async () => {
    const stampedAt: number = NOW - THRESHOLD_MS * 2;
    await seed('run-cold', [launched('run-cold')], stampedAt);

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-cold',
      NOW,
      THRESHOLD_MS,
    );

    expect(entry.state).toBe('stalled');
    expect(entry.stateEnteredAt).toBe(stampedAt);
  });

  it('falls back to the last event when a stalled run left no liveness signal', async () => {
    await seed('run-quiet', [launched('run-quiet')], null);

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-quiet',
      NOW,
      THRESHOLD_MS,
    );

    expect(entry.state).toBe('stalled');
    expect(entry.stateEnteredAt).toBe(1000);
  });

  it('carries the pending gate of a run awaiting a human decision', async () => {
    await seed(
      'run-gate',
      [
        {
          type: 'runLaunched',
          timestamp: 1000,
          runId: 'run-gate',
          runKind: 'pipeline',
          subject: 'feature-team',
          maxTurns: 0,
          artifactPath: null,
        },
        {
          type: 'stageStarted',
          timestamp: 2000,
          stage: 'architect',
          stageIndex: 0,
        },
        { type: 'gateWaitEntered', timestamp: 2200, stage: 'architect' },
      ],
      NOW,
    );

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-gate',
      NOW,
      THRESHOLD_MS,
    );

    expect(entry.state).toBe('awaiting-gate');
    expect(entry.runKind).toBe('pipeline');
    expect(entry.currentStage).toBe('architect');
    expect(entry.pendingGate).toBe('architect');
    expect(entry.stateEnteredAt).toBe(2200);
  });

  it('carries the terminal outcome of a failed run', async () => {
    await seed(
      'run-fail',
      [
        launched('run-fail'),
        {
          type: 'terminalOutcome',
          timestamp: 3000,
          succeeded: false,
          failureTier: 'invalid_artifact',
        },
      ],
      NOW,
    );

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-fail',
      NOW,
      THRESHOLD_MS,
    );

    expect(entry.state).toBe('failed');
    expect(entry.failureTier).toBe('invalid_artifact');
    expect(entry.stateEnteredAt).toBe(3000);
  });

  it('carries no conversation content from the role session', async () => {
    await seed('run-live', [launched('run-live')], NOW);

    const entry: RunListingEntry = await deriveListingEntry(
      baseDir,
      'run-live',
      NOW,
      THRESHOLD_MS,
    );

    expect(Object.keys(entry).sort()).toEqual([
      'currentStage',
      'failureTier',
      'lastEventAt',
      'maxTurns',
      'pendingGate',
      'runId',
      'runKind',
      'state',
      'stateEnteredAt',
      'subject',
      'turnsUsed',
    ]);
  });
});
