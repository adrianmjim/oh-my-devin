import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearSessionMode } from './clear-session-mode';
import type { ModeActivation } from './mode-activation';
import type { ModeReport } from './mode-report';
import { readSessionSlots } from './read-session-slots';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';

describe('clearSessionMode', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-clear-mode-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function stage(
    sessionId: string,
    invocation: string,
    at: number,
  ): Promise<void> {
    await recordSessionSeen(projectDir, sessionId, at);
    await stageSessionIdentity(projectDir, sessionId, `omd ${invocation}`, at);
  }

  async function activate(
    sessionId: string,
    mode: string,
    at: number,
  ): Promise<void> {
    await stage(sessionId, `mode set ${mode}`, at);
    await setSessionMode(projectDir, mode, null, `mode set ${mode}`, at + 1);
  }

  it('refuses a clear no live session staged', async () => {
    const report: ModeReport = await clearSessionMode(
      projectDir,
      null,
      'mode clear',
      100,
    );

    expect(report).toEqual({
      kind: 'refused',
      mode: null,
      reason: 'unattributable',
      holder: null,
    });
  });

  it('deactivates the named slot and reports it', async () => {
    await activate('sess-1', 'plan', 100);
    await activate('sess-1', 'verify', 110);
    await stage('sess-1', 'mode clear plan', 120);

    const report: ModeReport = await clearSessionMode(
      projectDir,
      'plan',
      'mode clear plan',
      130,
    );

    expect(report).toEqual({ kind: 'cleared', modes: ['plan'] });
    const held: readonly ModeActivation[] = await readSessionSlots(
      projectDir,
      'sess-1',
    );
    expect(held.map((slot: ModeActivation): string => slot.mode)).toEqual([
      'verify',
    ]);
  });

  it('deactivates every slot when no mode is named', async () => {
    await activate('sess-1', 'plan', 100);
    await activate('sess-1', 'verify', 110);
    await stage('sess-1', 'mode clear', 120);

    const report: ModeReport = await clearSessionMode(
      projectDir,
      null,
      'mode clear',
      130,
    );

    expect(report).toEqual({ kind: 'cleared', modes: ['plan', 'verify'] });
    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('reports nothing cleared when the session holds no such mode', async () => {
    await activate('sess-1', 'plan', 100);
    await stage('sess-1', 'mode clear team', 120);

    const report: ModeReport = await clearSessionMode(
      projectDir,
      'team',
      'mode clear team',
      130,
    );

    expect(report).toEqual({ kind: 'cleared', modes: [] });
  });

  it('leaves another session slots untouched', async () => {
    await activate('sess-2', 'plan', 100);
    await activate('sess-1', 'verify', 110);
    await stage('sess-1', 'mode clear', 120);

    await clearSessionMode(projectDir, null, 'mode clear', 130);

    expect(await readSessionSlots(projectDir, 'sess-2')).toHaveLength(1);
  });
});
