import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { modeStateRoot } from './mode-state-root';
import { pruneStaleSessions } from './prune-stale-sessions';
import { readSessionSlots } from './read-session-slots';
import { recordSessionSeen } from './record-session-seen';
import { writeSessionSlots } from './write-session-slots';

function activation(mode: string, sessionId: string): ModeActivation {
  return { mode, sessionId, activatedAt: 10, correlatedRunId: null };
}

describe('pruneStaleSessions', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-prune-sessions-'));
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

  it('deletes the partition of a stale session', async () => {
    await seat('sess-1', 'plan', 100);

    await pruneStaleSessions(projectDir, 100000, 100);

    expect(await readdir(modeStateRoot(projectDir))).toEqual([]);
  });

  it('keeps the partition of a live session', async () => {
    await seat('sess-1', 'plan', 1000);

    await pruneStaleSessions(projectDir, 1050, 100);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([
      activation('plan', 'sess-1'),
    ]);
  });

  it('prunes only the stale partitions', async () => {
    await seat('sess-1', 'plan', 1000);
    await seat('sess-2', 'team', 100);

    await pruneStaleSessions(projectDir, 1050, 100);

    expect(await readdir(modeStateRoot(projectDir))).toEqual(['sess-1']);
  });

  it('tolerates a project with no mode state', async () => {
    await expect(
      pruneStaleSessions(projectDir, 1000, 100),
    ).resolves.toBeUndefined();
  });
});
