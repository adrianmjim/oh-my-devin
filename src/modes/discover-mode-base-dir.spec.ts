import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverModeBaseDir } from './discover-mode-base-dir';

describe('discoverModeBaseDir', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-discover-base-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('stays at a directory that holds mode state', async () => {
    await mkdir(join(projectDir, '.omd'), { recursive: true });

    expect(await discoverModeBaseDir(projectDir)).toBe(projectDir);
  });

  it('climbs to the nearest ancestor holding mode state', async () => {
    await mkdir(join(projectDir, '.omd'), { recursive: true });
    const nested: string = join(projectDir, 'packages', 'app');
    await mkdir(nested, { recursive: true });

    expect(await discoverModeBaseDir(nested)).toBe(projectDir);
  });

  it('prefers the nearest of several marked ancestors', async () => {
    await mkdir(join(projectDir, '.omd'), { recursive: true });
    const inner: string = join(projectDir, 'packages');
    await mkdir(join(inner, '.omd'), { recursive: true });
    const nested: string = join(inner, 'app');
    await mkdir(nested, { recursive: true });

    expect(await discoverModeBaseDir(nested)).toBe(inner);
  });

  it('falls back to the given directory when nothing is marked', async () => {
    const nested: string = join(projectDir, 'packages', 'app');
    await mkdir(nested, { recursive: true });

    expect(await discoverModeBaseDir(nested)).toBe(nested);
  });

  it('ignores a stray file named like the marker', async () => {
    await mkdir(join(projectDir, '.omd'), { recursive: true });
    const nested: string = join(projectDir, 'packages');
    await mkdir(nested, { recursive: true });
    await writeFile(join(nested, '.omd'), 'not a directory', 'utf8');

    expect(await discoverModeBaseDir(nested)).toBe(projectDir);
  });
});
