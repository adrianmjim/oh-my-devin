import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JournalWriter } from '../observability/journal-writer';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeLivenessStamp } from '../observability/write-liveness-stamp';
import { clearSessionMode } from './clear-session-mode';
import { deriveStopDecision } from './derive-stop-decision';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';
import type { StopDecision } from './stop-decision';
import { STOP_BLOCK_ATTEMPT_BOUND } from './stop-block-attempt-bound';

describe('deriveStopDecision', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-stop-decision-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function stage(invocation: string, at: number): Promise<void> {
    await recordSessionSeen(projectDir, 'sess-1', at);
    await stageSessionIdentity(projectDir, 'sess-1', `omd ${invocation}`, at);
  }

  async function activate(
    mode: string,
    runId: string | null,
    at: number,
  ): Promise<void> {
    const invocation: string =
      runId === null ? `mode set ${mode}` : `mode set ${mode} --run ${runId}`;
    await stage(invocation, at);
    await setSessionMode(projectDir, mode, runId, invocation, at + 1);
  }

  async function writeRun(
    runId: string,
    terminal: boolean,
    now: number,
  ): Promise<void> {
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
        succeeded: true,
        failureTier: null,
      });
    }
    await writeLivenessStamp(paths.liveness, now);
  }

  it('approves a stop for a session holding no mode', async () => {
    const decision: StopDecision = await deriveStopDecision(
      projectDir,
      'sess-1',
      100,
    );

    expect(decision).toEqual({ decision: 'approve', reason: null });
  });

  it('approves a stop no session owns', async () => {
    expect((await deriveStopDecision(projectDir, null, 100)).decision).toBe(
      'approve',
    );
  });

  it('blocks on a non-terminal correlated run citing its identity and state', async () => {
    await writeRun('run-7', false, 110);
    await activate('ralph', 'run-7', 100);

    const decision: StopDecision = await deriveStopDecision(
      projectDir,
      'sess-1',
      110,
    );

    expect(decision.decision).toBe('block');
    expect(decision.reason).toContain('run-7');
    expect(decision.reason).toContain('running');
  });

  it('releases the hold once the correlated run is terminal', async () => {
    await writeRun('run-7', true, 110);
    await activate('ralph', 'run-7', 100);

    expect((await deriveStopDecision(projectDir, 'sess-1', 110)).decision).toBe(
      'approve',
    );
  });

  it('keeps the hold when the correlated run record is gone', async () => {
    await activate('ralph', 'run-missing', 100);

    const decision: StopDecision = await deriveStopDecision(
      projectDir,
      'sess-1',
      110,
    );

    expect(decision.decision).toBe('block');
    expect(decision.reason).toContain('run-missing');
    expect(decision.reason).toContain('cannot be verified');
  });

  it('blocks an uncorrelated mode on its verification criteria', async () => {
    await activate('plan', null, 100);

    const decision: StopDecision = await deriveStopDecision(
      projectDir,
      'sess-1',
      110,
    );

    expect(decision.decision).toBe('block');
    expect(decision.reason).toContain('plan artifact produced');
  });

  it('releases the prose hold once the mode is deactivated', async () => {
    await activate('plan', null, 100);
    await stage('mode clear', 120);
    await clearSessionMode(projectDir, null, 'mode clear', 130);

    expect((await deriveStopDecision(projectDir, 'sess-1', 140)).decision).toBe(
      'approve',
    );
  });

  it('approves and defers to the user at the attempt bound', async () => {
    await activate('plan', null, 100);
    for (let attempt = 0; attempt < STOP_BLOCK_ATTEMPT_BOUND; attempt += 1) {
      expect(
        (await deriveStopDecision(projectDir, 'sess-1', 110)).decision,
      ).toBe('block');
    }

    const decision: StopDecision = await deriveStopDecision(
      projectDir,
      'sess-1',
      110,
    );

    expect(decision.decision).toBe('approve');
    expect(decision.reason).not.toBeNull();
  });

  it('resets the count once a stop is approved', async () => {
    await activate('plan', null, 100);
    for (let attempt = 0; attempt <= STOP_BLOCK_ATTEMPT_BOUND; attempt += 1) {
      await deriveStopDecision(projectDir, 'sess-1', 110);
    }

    expect((await deriveStopDecision(projectDir, 'sess-1', 110)).decision).toBe(
      'block',
    );
  });
});
