import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enumerateSessions } from './enumerate-sessions';
import { modeStateRoot } from './mode-state-root';
import { recordSessionSeen } from './record-session-seen';
import type { SessionRegistryEntry } from './session-registry-entry';

describe('enumerateSessions', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-enumerate-sessions-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('enumerates nothing in a project with no mode state', async () => {
    expect(await enumerateSessions(projectDir)).toEqual([]);
  });

  it('enumerates every recorded session', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await recordSessionSeen(projectDir, 'sess-2', 2000);

    const entries: readonly SessionRegistryEntry[] =
      await enumerateSessions(projectDir);

    expect([...entries].sort((a, b) => a.lastSeenAt - b.lastSeenAt)).toEqual([
      { sessionId: 'sess-1', lastSeenAt: 1000 },
      { sessionId: 'sess-2', lastSeenAt: 2000 },
    ]);
  });

  it('skips a partition holding no readable record', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 1000);
    await mkdir(join(modeStateRoot(projectDir), 'sess-empty'), {
      recursive: true,
    });

    const entries: readonly SessionRegistryEntry[] =
      await enumerateSessions(projectDir);

    expect(entries).toEqual([{ sessionId: 'sess-1', lastSeenAt: 1000 }]);
  });
});
