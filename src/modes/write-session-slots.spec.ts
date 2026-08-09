import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { readSessionSlots } from './read-session-slots';
import { writeSessionSlots } from './write-session-slots';

function activation(mode: string, sessionId: string): ModeActivation {
  return { mode, sessionId, activatedAt: 10, correlatedRunId: null };
}

describe('writeSessionSlots', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-slots-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('records an activation under its owning session', async () => {
    await writeSessionSlots(projectDir, 'sess-1', [
      activation('plan', 'sess-1'),
    ]);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([
      activation('plan', 'sess-1'),
    ]);
  });

  it('leaves another session slots untouched', async () => {
    await writeSessionSlots(projectDir, 'sess-1', [
      activation('plan', 'sess-1'),
    ]);
    await writeSessionSlots(projectDir, 'sess-2', [
      activation('team', 'sess-2'),
    ]);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([
      activation('plan', 'sess-1'),
    ]);
  });

  it('replaces the session slot set on a later write', async () => {
    await writeSessionSlots(projectDir, 'sess-1', [
      activation('plan', 'sess-1'),
    ]);
    await writeSessionSlots(projectDir, 'sess-1', []);

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('writes nothing for an id that would escape the root', async () => {
    await writeSessionSlots(projectDir, '../escape', [
      activation('plan', '../escape'),
    ]);

    expect(await readSessionSlots(projectDir, '../escape')).toEqual([]);
  });
});
