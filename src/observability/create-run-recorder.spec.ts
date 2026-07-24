import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRunRecorder } from './create-run-recorder';
import type { RunId } from './run-id';
import type { RunObserver } from './run-observer';

describe('createRunRecorder', () => {
  let dir: string = '';
  const runId: RunId = 'run-xyz';

  beforeEach(async (): Promise<void> => {
    dir = await mkdtemp(join(tmpdir(), 'omd-recorder-'));
  });

  afterEach(async (): Promise<void> => {
    await rm(dir, { recursive: true, force: true });
  });

  it('appends events as JSON lines under .omd/runs/<runId>/events.jsonl', async () => {
    const recorder: RunObserver = createRunRecorder(dir, runId, (): number => {
      return 1000;
    });
    await recorder.append({
      type: 'runLaunched',
      timestamp: 1000,
      runId,
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: 'review.json',
    });
    recorder.close();

    const journal: string = await readFile(
      join(dir, '.omd', 'runs', runId, 'events.jsonl'),
      'utf8',
    );
    const lines: readonly string[] = journal.trim().split('\n');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? '')).toMatchObject({
      type: 'runLaunched',
      runId,
      runKind: 'single-role',
    });
  });

  it('refreshes a liveness stamp alongside the journal', async () => {
    const recorder: RunObserver = createRunRecorder(dir, runId, (): number => {
      return 2000;
    });
    await recorder.append({
      type: 'runLaunched',
      timestamp: 2000,
      runId,
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: 'review.json',
    });
    recorder.close();

    const stamp: string = await readFile(
      join(dir, '.omd', 'runs', runId, 'liveness.json'),
      'utf8',
    );
    expect(JSON.parse(stamp)).toEqual({ stampedAt: 2000 });
  });
});
