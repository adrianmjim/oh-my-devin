import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SessionId } from '../modes/session-id';
import { SessionStatePaths } from '../modes/session-state-paths';
import { writePendingNotices } from './write-pending-notices';

const SESSION: SessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('writePendingNotices', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-write-notices-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('writes the queue into the session state directory', async () => {
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);

    const raw: string = await readFile(
      new SessionStatePaths(baseDir, SESSION).notices,
      'utf8',
    );

    expect(JSON.parse(raw)).toEqual([
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);
  });

  it('replaces the queue rather than appending to it', async () => {
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);
    await writePendingNotices(baseDir, SESSION, []);

    const raw: string = await readFile(
      new SessionStatePaths(baseDir, SESSION).notices,
      'utf8',
    );

    expect(JSON.parse(raw)).toEqual([]);
  });

  it('writes nothing for a session id that is not a safe segment', async () => {
    await expect(
      writePendingNotices(baseDir, '../escape', []),
    ).resolves.toBeUndefined();
  });
});
