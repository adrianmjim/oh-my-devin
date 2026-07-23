import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JournalWriter } from './journal-writer';
import type { ProgressEvent } from './progress-event';
import { readJournal } from './read-journal';
import { RunRecordPaths } from './run-record-paths';

const LAUNCHED: ProgressEvent = {
  type: 'runLaunched',
  timestamp: 1000,
  runId: 'run-1',
  runKind: 'single-role',
  subject: 'reviewer',
  maxTurns: 8,
  artifactPath: 'review.json',
};

const TURN: ProgressEvent = {
  type: 'turnCompleted',
  timestamp: 1100,
  turnIndex: 0,
  boundary: 'launch',
};

describe('readJournal', () => {
  let base: string = '';

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-read-journal-'));
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('reads back every appended event in order', async () => {
    const paths = new RunRecordPaths(base, 'run-1');
    const writer = new JournalWriter(paths.journal);
    await writer.append(LAUNCHED);
    await writer.append(TURN);

    const events: readonly ProgressEvent[] | null = await readJournal(
      paths.journal,
    );

    expect(events).toEqual([LAUNCHED, TURN]);
  });

  it('returns null when the journal does not exist', async () => {
    const paths = new RunRecordPaths(base, 'ghost');

    expect(await readJournal(paths.journal)).toBeNull();
  });

  it('skips lines that are valid JSON but not progress events', async () => {
    const paths = new RunRecordPaths(base, 'run-mixed');
    await mkdir(dirname(paths.journal), { recursive: true });
    await writeFile(
      paths.journal,
      `${JSON.stringify(LAUNCHED)}\n${JSON.stringify({ foo: 'bar' })}\n${JSON.stringify(TURN)}\n`,
      'utf8',
    );

    expect(await readJournal(paths.journal)).toEqual([LAUNCHED, TURN]);
  });
});
