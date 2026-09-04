import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { realDirectory } from './real-directory';

describe('realDirectory', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'omd-real-dir-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('resolves a symlinked directory to the directory it names', async () => {
    const target: string = join(root, 'target');
    const link: string = join(root, 'link');
    await mkdir(target, { recursive: true });
    await symlink(target, link, 'dir');

    expect(await realDirectory(link)).toBe(await realDirectory(target));
  });

  it('resolves a plain directory to itself', async () => {
    const plain: string = join(root, 'plain');
    await mkdir(plain, { recursive: true });

    expect(await realDirectory(plain)).toBe(
      (await realDirectory(root)) + '/plain',
    );
  });

  it('falls back to the resolved path for a directory that is gone', async () => {
    expect(await realDirectory(join(root, 'absent'))).toBe(
      resolve(join(root, 'absent')),
    );
  });
});
