import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readIfExists } from './read-if-exists';

describe('readIfExists', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-if-exists-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the content of an existing file', async () => {
    const path: string = join(directory, 'present.txt');
    await writeFile(path, 'content', 'utf8');

    expect(await readIfExists(path)).toBe('content');
  });

  it('is null for an absent file', async () => {
    expect(await readIfExists(join(directory, 'absent.txt'))).toBeNull();
  });

  it('is null for a path that is not a readable file', async () => {
    expect(await readIfExists(directory)).toBeNull();
  });
});
