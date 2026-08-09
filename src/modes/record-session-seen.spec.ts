import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';
import { readSessionSeen } from './read-session-seen';
import { readSessionSlots } from './read-session-slots';
import { recordSessionSeen } from './record-session-seen';
import type { SessionRegistryEntry } from './session-registry-entry';
import { writeSessionSlots } from './write-session-slots';

const HELD_SLOT: ModeActivation = {
  mode: 'ralph',
  sessionId: 'sess-1',
  activatedAt: 500,
  correlatedRunId: null,
};

describe('recordSessionSeen', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-session-seen-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('records a session last seen at the piped event time', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);

    const entry: SessionRegistryEntry | null = await readSessionSeen(
      projectDir,
      'sess-1',
    );

    expect(entry).toEqual({ sessionId: 'sess-1', lastSeenAt: 1000 });
  });

  it('refreshes the last-seen time on a later event', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await recordSessionSeen(projectDir, 'sess-1', 5000);

    const entry: SessionRegistryEntry | null = await readSessionSeen(
      projectDir,
      'sess-1',
    );

    expect(entry?.lastSeenAt).toBe(5000);
  });

  it('keeps every session record to itself', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await recordSessionSeen(projectDir, 'sess-2', 7000);

    expect((await readSessionSeen(projectDir, 'sess-1'))?.lastSeenAt).toBe(
      1000,
    );
    expect((await readSessionSeen(projectDir, 'sess-2'))?.lastSeenAt).toBe(
      7000,
    );
  });

  it('returns a session modeless once its stamp lapsed', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await writeSessionSlots(projectDir, 'sess-1', [HELD_SLOT]);
    const returnedAt: number = 1000 + MODE_STALENESS_THRESHOLD_MS + 1;

    await recordSessionSeen(projectDir, 'sess-1', returnedAt);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
    expect((await readSessionSeen(projectDir, 'sess-1'))?.lastSeenAt).toBe(
      returnedAt,
    );
  });

  it('keeps the slots of a session refreshed within the threshold', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await writeSessionSlots(projectDir, 'sess-1', [HELD_SLOT]);

    await recordSessionSeen(projectDir, 'sess-1', 2000);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([HELD_SLOT]);
  });

  it('records nothing for an id that would escape the root', async () => {
    await recordSessionSeen(projectDir, '../escape', 1000);

    expect(await readSessionSeen(projectDir, '../escape')).toBeNull();
  });
});
