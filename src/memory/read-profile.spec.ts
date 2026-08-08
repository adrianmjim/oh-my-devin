import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from './memory-store-paths';
import type { ProfileSnapshot } from './profile-snapshot';
import { readProfile } from './read-profile';

const SNAPSHOT: ProfileSnapshot = {
  stack: ['node'],
  layout: ['src'],
  entryCommands: ['pnpm run test'],
  derivedAt: 5,
};

describe('readProfile', () => {
  let projectDir: string;
  let paths: MemoryStorePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-profile-'));
    paths = new MemoryStorePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeProfileFile(content: string): Promise<void> {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.profile, content, 'utf8');
  }

  it('reads no snapshot from a store that was never written', async () => {
    expect(await readProfile(projectDir)).toBeNull();
  });

  it('reads back the cached snapshot', async () => {
    await writeProfileFile(JSON.stringify(SNAPSHOT));

    expect(await readProfile(projectDir)).toEqual(SNAPSHOT);
  });

  it('reads no snapshot from an unparseable store', async () => {
    await writeProfileFile('not json at all');

    expect(await readProfile(projectDir)).toBeNull();
  });

  it('reads no snapshot from a store whose shape it does not recognize', async () => {
    await writeProfileFile(JSON.stringify({ stack: 'node' }));

    expect(await readProfile(projectDir)).toBeNull();
  });
});
