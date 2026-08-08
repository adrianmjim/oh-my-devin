import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from './memory-store-paths';
import type { ProfileSnapshot } from './profile-snapshot';
import { readProfile } from './read-profile';
import { writeProfile } from './write-profile';

const SNAPSHOT: ProfileSnapshot = {
  stack: ['node'],
  layout: ['src'],
  entryCommands: ['pnpm run test'],
  derivedAt: 5,
};

describe('writeProfile', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-profile-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('caches the snapshot in the durable subtree', async () => {
    await writeProfile(projectDir, SNAPSHOT);

    expect(await readProfile(projectDir)).toEqual(SNAPSHOT);
  });

  it('writes the profile and nothing outside the memory subtree', async () => {
    const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);

    await writeProfile(projectDir, SNAPSHOT);

    expect(JSON.parse(await readFile(paths.profile, 'utf8'))).toEqual(SNAPSHOT);
    await expect(readFile(paths.notepad, 'utf8')).rejects.toThrow();
  });

  it('keeps only the newest snapshot, holding the class to its cap', async () => {
    await writeProfile(projectDir, SNAPSHOT);

    await writeProfile(projectDir, { ...SNAPSHOT, derivedAt: 9 });

    expect((await readProfile(projectDir))?.derivedAt).toBe(9);
  });
});
