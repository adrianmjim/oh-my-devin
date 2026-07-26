import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readDirectories } from './read-directories';

describe('readDirectories', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-directories-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields only the subdirectories', async () => {
    await mkdir(join(directory, 'reviewer'));
    await writeFile(join(directory, 'note.txt'), 'x', 'utf8');

    expect(
      (await readDirectories(directory)).map(
        (entry: Dirent): string => entry.name,
      ),
    ).toEqual(['reviewer']);
  });

  it('is empty for an unreadable path', async () => {
    expect(await readDirectories(join(directory, 'absent'))).toEqual([]);
  });
});
