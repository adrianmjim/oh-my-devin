import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SessionId } from '../modes/session-id';
import { SessionStatePaths } from '../modes/session-state-paths';
import type { PendingNotice } from './pending-notice';
import { readPendingNotices } from './read-pending-notices';
import { writePendingNotices } from './write-pending-notices';

const SESSION: SessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('readPendingNotices', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-notices-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('reads back what the session queued', async () => {
    const notices: readonly PendingNotice[] = [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
      { tool: 'create', filePath: 'src/b.ts', noticedAt: 2 },
    ];
    await writePendingNotices(baseDir, SESSION, notices);

    expect(await readPendingNotices(baseDir, SESSION)).toEqual(notices);
  });

  it('reads nothing for a session that queued nothing', async () => {
    expect(await readPendingNotices(baseDir, SESSION)).toEqual([]);
  });

  it('reads nothing out of an unparseable or malformed queue', async () => {
    const paths: SessionStatePaths = new SessionStatePaths(baseDir, SESSION);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.notices, '{ not json', 'utf8');

    expect(await readPendingNotices(baseDir, SESSION)).toEqual([]);

    await writeFile(paths.notices, JSON.stringify([{ tool: 'edit' }]), 'utf8');

    expect(await readPendingNotices(baseDir, SESSION)).toEqual([]);
  });

  it('keeps one session queue out of another', async () => {
    const other: SessionId = '11111111-2222-3333-4444-555555555555';
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);

    expect(await readPendingNotices(baseDir, other)).toEqual([]);
  });
});
