import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SessionId } from '../modes/session-id';
import { deliverGuardNotices } from './deliver-guard-notices';
import { readPendingNotices } from './read-pending-notices';
import { writePendingNotices } from './write-pending-notices';

const SESSION: SessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('deliverGuardNotices', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-deliver-notices-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('delivers the queued notices', async () => {
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);

    expect(await deliverGuardNotices(baseDir, SESSION)).toContain('src/a.ts');
  });

  it('clears the queue once delivered', async () => {
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);
    await deliverGuardNotices(baseDir, SESSION);

    expect(await readPendingNotices(baseDir, SESSION)).toEqual([]);
  });

  it('does not repeat a delivered notice on the next prompt', async () => {
    await writePendingNotices(baseDir, SESSION, [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);
    await deliverGuardNotices(baseDir, SESSION);

    expect(await deliverGuardNotices(baseDir, SESSION)).toBe('');
  });

  it('delivers nothing for a session that queued nothing', async () => {
    expect(await deliverGuardNotices(baseDir, SESSION)).toBe('');
  });

  it('delivers nothing for an unidentified session', async () => {
    expect(await deliverGuardNotices(baseDir, null)).toBe('');
  });
});
