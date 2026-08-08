import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JournalWriter } from '../observability/journal-writer';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeLivenessStamp } from '../observability/write-liveness-stamp';
import { deriveModeHold } from './derive-mode-hold';
import type { ModeActivation } from './mode-activation';

function activation(mode: string, runId: string | null): ModeActivation {
  return {
    mode,
    sessionId: 'sess-1',
    activatedAt: 10,
    correlatedRunId: runId,
  };
}

describe('deriveModeHold', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-mode-hold-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeRun(runId: string, terminal: boolean): Promise<void> {
    const paths: RunRecordPaths = new RunRecordPaths(projectDir, runId);
    const writer: JournalWriter = new JournalWriter(paths.journal);
    await writer.append({
      type: 'runLaunched',
      timestamp: 1,
      runId,
      runKind: 'single-role',
      subject: 'executor',
      maxTurns: 4,
      artifactPath: null,
    });
    if (terminal) {
      await writer.append({
        type: 'terminalOutcome',
        timestamp: 2,
        succeeded: false,
        failureTier: null,
      });
    }
    await writeLivenessStamp(paths.liveness, 100);
  }

  it('holds an uncorrelated mode on its verification criteria', async () => {
    const hold: string | null = await deriveModeHold(
      projectDir,
      activation('plan', null),
      100,
    );

    expect(hold).toContain('plan artifact produced');
  });

  it('holds nothing for a mode outside the state catalog', async () => {
    expect(
      await deriveModeHold(projectDir, activation('deep-dive', null), 100),
    ).toBeNull();
  });

  it('holds on a non-terminal correlated run', async () => {
    await writeRun('run-7', false);

    const hold: string | null = await deriveModeHold(
      projectDir,
      activation('ralph', 'run-7'),
      100,
    );

    expect(hold).toContain('run-7');
    expect(hold).toContain('running');
  });

  it('holds nothing once the correlated run failed', async () => {
    await writeRun('run-7', true);

    expect(
      await deriveModeHold(projectDir, activation('ralph', 'run-7'), 100),
    ).toBeNull();
  });

  it('holds nothing when the correlated run record is gone', async () => {
    expect(
      await deriveModeHold(projectDir, activation('ralph', 'run-gone'), 100),
    ).toBeNull();
  });

  it('holds on a stalled correlated run', async () => {
    await writeRun('run-7', false);

    const hold: string | null = await deriveModeHold(
      projectDir,
      activation('ralph', 'run-7'),
      99999999,
    );

    expect(hold).toContain('stalled');
  });
});
