import { mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fileMtime } from './file-mtime';

describe('fileMtime', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-file-mtime-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the modification time of a file', async () => {
    const file: string = join(directory, 'events.jsonl');
    await writeFile(file, 'x', 'utf8');
    await utimes(file, new Date(12345000), new Date(12345000));

    expect(await fileMtime(file)).toBe(12345000);
  });

  it('is null for an absent path', async () => {
    expect(await fileMtime(join(directory, 'absent.json'))).toBeNull();
  });

  it('is null for a path that is not a file', async () => {
    expect(await fileMtime(directory)).toBeNull();
  });
});
