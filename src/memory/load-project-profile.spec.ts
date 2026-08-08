import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadProjectProfile } from './load-project-profile';
import { PROFILE_STALENESS_WINDOW_MS } from './profile-staleness-window-ms';
import type { ProfileSnapshot } from './profile-snapshot';
import { readProfile } from './read-profile';
import { writeProfile } from './write-profile';

const FABRICATED: ProfileSnapshot = {
  stack: ['fabricated'],
  layout: ['fabricated'],
  entryCommands: ['fabricated'],
  derivedAt: 1000,
};

describe('loadProjectProfile', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-load-profile-'));
    await mkdir(join(projectDir, 'src'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('derives and caches a snapshot when the store holds none', async () => {
    const snapshot: ProfileSnapshot = await loadProjectProfile(
      projectDir,
      1000,
    );

    expect(snapshot.layout).toEqual(['src']);
    expect(await readProfile(projectDir)).toEqual(snapshot);
  });

  it('serves the cached snapshot within the staleness window', async () => {
    await writeProfile(projectDir, FABRICATED);

    const snapshot: ProfileSnapshot = await loadProjectProfile(
      projectDir,
      FABRICATED.derivedAt + PROFILE_STALENESS_WINDOW_MS - 1,
    );

    expect(snapshot).toEqual(FABRICATED);
  });

  it('refreshes the snapshot once the staleness window has passed', async () => {
    await writeProfile(projectDir, FABRICATED);
    const now: number = FABRICATED.derivedAt + PROFILE_STALENESS_WINDOW_MS;

    const snapshot: ProfileSnapshot = await loadProjectProfile(projectDir, now);

    expect(snapshot.layout).toEqual(['src']);
    expect(snapshot.derivedAt).toBe(now);
    expect(await readProfile(projectDir)).toEqual(snapshot);
  });

  it('refreshes a snapshot the repository has outgrown, not the reverse', async () => {
    await writeProfile(projectDir, FABRICATED);
    await mkdir(join(projectDir, 'docs'), { recursive: true });
    await writeFile(join(projectDir, 'package.json'), '{}', 'utf8');

    const snapshot: ProfileSnapshot = await loadProjectProfile(
      projectDir,
      FABRICATED.derivedAt + PROFILE_STALENESS_WINDOW_MS,
    );

    expect(snapshot.layout).toEqual(['docs', 'src']);
    expect(snapshot.stack).toEqual(['node']);
  });
});
