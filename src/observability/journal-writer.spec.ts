import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ProgressEvent } from './progress-event';
import { JournalWriter } from './journal-writer';

function lines(raw: string): readonly string[] {
  return raw.split('\n').filter((line: string): boolean => line.trim() !== '');
}

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

describe('JournalWriter', () => {
  let base: string = '';
  let journalPath: string = '';

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-journal-'));
    journalPath = join(base, '.omd', 'runs', 'run-1', 'events.jsonl');
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('creates the run record directory on the first write', async () => {
    const writer = new JournalWriter(journalPath);
    await writer.append(LAUNCHED);

    const dirStat = await stat(join(base, '.omd', 'runs', 'run-1'));
    expect(dirStat.isDirectory()).toBe(true);
  });

  it('appends exactly one JSON line per event', async () => {
    const writer = new JournalWriter(journalPath);
    await writer.append(LAUNCHED);
    await writer.append(TURN);

    const raw: string = await readFile(journalPath, 'utf8');
    const recorded: readonly string[] = lines(raw);
    expect(recorded).toHaveLength(2);
    expect(JSON.parse(recorded[0] ?? '')).toEqual(LAUNCHED);
    expect(JSON.parse(recorded[1] ?? '')).toEqual(TURN);
  });

  it('never rewrites lines already appended', async () => {
    const writer = new JournalWriter(journalPath);
    await writer.append(LAUNCHED);
    const afterFirst: string = await readFile(journalPath, 'utf8');
    await writer.append(TURN);
    const afterSecond: string = await readFile(journalPath, 'utf8');

    expect(afterSecond.startsWith(afterFirst)).toBe(true);
    expect(lines(afterSecond)[0]).toBe(lines(afterFirst)[0]);
  });
});
