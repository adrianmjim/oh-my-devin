import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import type { ModeReport } from './mode-report';
import { readSessionSlots } from './read-session-slots';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';

describe('setSessionMode', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-set-mode-'));
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

  it('refuses an activation no live session staged', async () => {
    const report: ModeReport = await setSessionMode(
      projectDir,
      'plan',
      null,
      'mode set plan',
      100,
    );

    expect(report).toEqual({
      kind: 'refused',
      mode: 'plan',
      reason: 'unattributable',
      holder: null,
    });
  });

  it('writes no activation when it refuses', async () => {
    await setSessionMode(projectDir, 'plan', null, 'mode set plan', 100);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('attributes the activation to the staging session', async () => {
    await stage('sess-1', 'mode set plan', 100);

    const report: ModeReport = await setSessionMode(
      projectDir,
      'plan',
      null,
      'mode set plan',
      110,
    );

    expect(report).toEqual({ kind: 'joined', mode: 'plan', alongside: [] });
    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([
      {
        mode: 'plan',
        sessionId: 'sess-1',
        activatedAt: 110,
        correlatedRunId: null,
      },
    ]);
  });

  it('records the correlated run the activation carries', async () => {
    await stage('sess-1', 'mode set ralph --run run-7', 100);

    await setSessionMode(
      projectDir,
      'ralph',
      'run-7',
      'mode set ralph --run run-7',
      110,
    );

    const held: readonly ModeActivation[] = await readSessionSlots(
      projectDir,
      'sess-1',
    );

    expect(held[0]?.correlatedRunId).toBe('run-7');
  });

  it('lets two support modes coexist and reports the join', async () => {
    await stage('sess-1', 'mode set plan', 100);
    await setSessionMode(projectDir, 'plan', null, 'mode set plan', 110);
    await stage('sess-1', 'mode set verify', 120);

    const report: ModeReport = await setSessionMode(
      projectDir,
      'verify',
      null,
      'mode set verify',
      130,
    );

    expect(report).toEqual({
      kind: 'joined',
      mode: 'verify',
      alongside: ['plan'],
    });
  });

  it('updates the slot in place when the mode is re-activated', async () => {
    await stage('sess-1', 'mode set plan', 100);
    await setSessionMode(projectDir, 'plan', null, 'mode set plan', 110);
    await stage('sess-1', 'mode set plan --run run-7', 120);
    await setSessionMode(
      projectDir,
      'plan',
      'run-7',
      'mode set plan --run run-7',
      130,
    );

    const held: readonly ModeActivation[] = await readSessionSlots(
      projectDir,
      'sess-1',
    );

    expect(held).toHaveLength(1);
    expect(held[0]?.correlatedRunId).toBe('run-7');
  });

  it('refuses a class member held by another live session', async () => {
    await stage('sess-2', 'mode set autopilot', 100);
    await setSessionMode(
      projectDir,
      'autopilot',
      null,
      'mode set autopilot',
      110,
    );
    await stage('sess-1', 'mode set team', 120);

    const report: ModeReport = await setSessionMode(
      projectDir,
      'team',
      null,
      'mode set team',
      130,
    );

    expect(report).toEqual({
      kind: 'refused',
      mode: 'team',
      reason: 'exclusive-conflict',
      holder: { mode: 'autopilot', sessionId: 'sess-2' },
    });
    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('displaces a class member held by the activating session', async () => {
    await stage('sess-1', 'mode set autopilot', 100);
    await setSessionMode(
      projectDir,
      'autopilot',
      null,
      'mode set autopilot',
      110,
    );
    await stage('sess-1', 'mode set ralph', 120);

    const report: ModeReport = await setSessionMode(
      projectDir,
      'ralph',
      null,
      'mode set ralph',
      130,
    );

    expect(report).toEqual({
      kind: 'displaced',
      mode: 'ralph',
      displaced: 'autopilot',
    });
    const held: readonly ModeActivation[] = await readSessionSlots(
      projectDir,
      'sess-1',
    );
    expect(held.map((slot: ModeActivation): string => slot.mode)).toEqual([
      'ralph',
    ]);
  });

  it('admits exactly one of two concurrent exclusive activations', async () => {
    await stage('sess-1', 'mode set ralph', 100);
    await stage('sess-2', 'mode set team', 100);

    const reports: readonly ModeReport[] = await Promise.all([
      setSessionMode(projectDir, 'ralph', null, 'mode set ralph', 110),
      setSessionMode(projectDir, 'team', null, 'mode set team', 110),
    ]);

    const admitted: readonly ModeReport[] = reports.filter(
      (report: ModeReport): boolean => report.kind !== 'refused',
    );
    expect(admitted).toHaveLength(1);
  });

  it('lets a stale holder go and admits the activation', async () => {
    await stage('sess-2', 'mode set autopilot', 100);
    await setSessionMode(
      projectDir,
      'autopilot',
      null,
      'mode set autopilot',
      110,
    );
    await stage('sess-1', 'mode set team', 9000000);

    const report: ModeReport = await setSessionMode(
      projectDir,
      'team',
      null,
      'mode set team',
      9000010,
    );

    expect(report.kind).toBe('joined');
  });
});
