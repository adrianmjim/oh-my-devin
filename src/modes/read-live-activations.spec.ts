import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { readLiveActivations } from './read-live-activations';
import { recordSessionSeen } from './record-session-seen';
import { SessionStatePaths } from './session-state-paths';
import { writeSessionSlots } from './write-session-slots';

function activation(mode: string, sessionId: string): ModeActivation {
  return { mode, sessionId, activatedAt: 10, correlatedRunId: null };
}

describe('readLiveActivations', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-live-activations-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function seat(
    sessionId: string,
    mode: string,
    lastSeenAt: number,
  ): Promise<void> {
    await recordSessionSeen(projectDir, sessionId, lastSeenAt);
    await writeSessionSlots(projectDir, sessionId, [
      activation(mode, sessionId),
    ]);
  }

  it('reads nothing in a project with no mode state', async () => {
    expect(await readLiveActivations(projectDir, 1000, 100)).toEqual([]);
  });

  it('reads the activations of every live session', async () => {
    await seat('sess-1', 'plan', 1000);
    await seat('sess-2', 'team', 1000);

    const live: readonly ModeActivation[] = await readLiveActivations(
      projectDir,
      1050,
      100,
    );

    expect(
      live.map((slot: ModeActivation): string => slot.mode).sort(),
    ).toEqual(['plan', 'team']);
  });

  it('treats an activation owned by a stale session as inactive', async () => {
    await seat('sess-1', 'plan', 1000);
    await seat('sess-2', 'team', 100);

    const live: readonly ModeActivation[] = await readLiveActivations(
      projectDir,
      1050,
      100,
    );

    expect(live.map((slot: ModeActivation): string => slot.mode)).toEqual([
      'plan',
    ]);
  });

  it('writes nothing while deriving', async () => {
    await seat('sess-1', 'plan', 100);
    const paths: SessionStatePaths = new SessionStatePaths(
      projectDir,
      'sess-1',
    );
    const before: string = await readFile(paths.slots, 'utf8');

    await readLiveActivations(projectDir, 100000, 100);

    expect(await readFile(paths.slots, 'utf8')).toBe(before);
  });
});
