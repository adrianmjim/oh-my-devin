import { mkdir, mkdtemp, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { JournalWriter } from './journal-writer';
import { loadRunSnapshot } from './load-run-snapshot';
import type { ProgressEvent } from './progress-event';
import { RunRecordPaths } from './run-record-paths';
import type { RunSnapshot } from './run-snapshot';
import { writeLivenessStamp } from './write-liveness-stamp';

const THRESHOLD: number = 120000;

const LAUNCHED: ProgressEvent = {
  type: 'runLaunched',
  timestamp: 1000,
  runId: 'run-1',
  runKind: 'single-role',
  subject: 'reviewer',
  maxTurns: 8,
  artifactPath: 'review.json',
};

describe('loadRunSnapshot', () => {
  let base: string = '';

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-load-snapshot-'));
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('rejects an identity that resolves to no run as a usage error', async () => {
    await expect(
      loadRunSnapshot(base, 'ghost', 10000, THRESHOLD),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a traversing identity instead of reading outside the run record root', async () => {
    const project: string = join(base, 'project');
    await mkdir(project, { recursive: true });
    const writer = new JournalWriter(join(base, 'escape', 'events.jsonl'));
    await writer.append(LAUNCHED);

    await expect(
      loadRunSnapshot(project, '../../../escape', 10000, THRESHOLD),
    ).rejects.toThrow(UsageError);
  });

  it('returns a running launching snapshot when the record dir exists but no journal is written yet', async () => {
    const paths = new RunRecordPaths(base, 'run-booting');
    await mkdir(paths.dir, { recursive: true });

    const snapshot: RunSnapshot = await loadRunSnapshot(
      base,
      'run-booting',
      Date.now(),
      THRESHOLD,
    );

    expect(snapshot.runId).toBe('run-booting');
    expect(snapshot.state).toBe('running');
  });

  it('ages a pre-journal record into stalled once the record dir goes cold', async () => {
    const paths = new RunRecordPaths(base, 'run-dead-boot');
    await mkdir(paths.dir, { recursive: true });
    const cold: Date = new Date(Date.now() - THRESHOLD - 60000);
    await utimes(paths.dir, cold, cold);

    const snapshot: RunSnapshot = await loadRunSnapshot(
      base,
      'run-dead-boot',
      Date.now(),
      THRESHOLD,
    );

    expect(snapshot.state).toBe('stalled');
    expect(snapshot.lastEventAt).toBeLessThan(Date.now() - THRESHOLD);
  });

  it('derives a running snapshot from a live run record', async () => {
    const paths = new RunRecordPaths(base, 'run-1');
    const writer = new JournalWriter(paths.journal);
    await writer.append(LAUNCHED);
    await writeLivenessStamp(paths.liveness, 9000);

    const snapshot: RunSnapshot = await loadRunSnapshot(
      base,
      'run-1',
      10000,
      THRESHOLD,
    );

    expect(snapshot.runId).toBe('run-1');
    expect(snapshot.state).toBe('running');
  });

  it('derives a stalled snapshot when the liveness stamp has gone cold', async () => {
    const paths = new RunRecordPaths(base, 'run-1');
    const writer = new JournalWriter(paths.journal);
    await writer.append(LAUNCHED);
    await writeLivenessStamp(paths.liveness, 1000);

    const snapshot: RunSnapshot = await loadRunSnapshot(
      base,
      'run-1',
      1000 + THRESHOLD + 1,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('stalled');
  });
});
