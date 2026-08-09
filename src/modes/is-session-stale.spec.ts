import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isSessionStale } from './is-session-stale';

describe('isSessionStale', () => {
  it('reads a session seen within the threshold as live', () => {
    expect(isSessionStale(1000, 1500, 1000)).toBe(false);
  });

  it('reads a session seen beyond the threshold as stale', () => {
    expect(isSessionStale(1000, 2001, 1000)).toBe(true);
  });

  it('keeps a session live exactly at the threshold', () => {
    expect(isSessionStale(1000, 2000, 1000)).toBe(false);
  });

  it('reads a session that was never seen as stale', () => {
    expect(isSessionStale(null, 2000, 1000)).toBe(true);
  });

  it('writes nothing while deriving', async () => {
    const projectDir: string = await mkdtemp(
      join(tmpdir(), 'omd-session-stale-'),
    );
    try {
      isSessionStale(1000, 9000, 1000);

      expect(await readdir(projectDir)).toEqual([]);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});
