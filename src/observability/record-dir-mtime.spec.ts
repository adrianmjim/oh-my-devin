import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordDirMtime } from './record-dir-mtime';

describe('recordDirMtime', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-record-dir-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the modification time of a record directory', async () => {
    const mtime: number | null = await recordDirMtime(directory);

    expect(typeof mtime).toBe('number');
    expect(mtime).toBeGreaterThan(0);
  });

  it('is null for an absent directory', async () => {
    expect(await recordDirMtime(join(directory, 'absent'))).toBeNull();
  });

  it('is null for a path that is not a directory', async () => {
    const file: string = join(directory, 'file.txt');
    await writeFile(file, 'x', 'utf8');

    expect(await recordDirMtime(file)).toBeNull();
  });
});
