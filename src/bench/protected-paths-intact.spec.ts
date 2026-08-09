import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { protectedPathsIntact } from './protected-paths-intact';

const TEST_BODY: string = 'it("returns null for missing input", () => {});\n';

describe('protectedPathsIntact', () => {
  let originalDir: string;
  let treeDir: string;

  async function writeInto(
    root: string,
    path: string,
    content: string,
  ): Promise<void> {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content, 'utf8');
  }

  beforeEach(async () => {
    originalDir = await mkdtemp(join(tmpdir(), 'omd-bench-original-'));
    treeDir = await mkdtemp(join(tmpdir(), 'omd-bench-post-run-'));
    await writeInto(originalDir, 'test/parse.test.js', TEST_BODY);
  });

  afterEach(async () => {
    await rm(originalDir, { recursive: true, force: true });
    await rm(treeDir, { recursive: true, force: true });
  });

  it('holds when every protected file matches the original byte for byte', async () => {
    await writeInto(treeDir, 'test/parse.test.js', TEST_BODY);

    await expect(
      protectedPathsIntact(originalDir, treeDir, ['test/parse.test.js']),
    ).resolves.toBe(true);
  });

  it('fails when a protected test is weakened but keeps its fragments', async () => {
    await writeInto(
      treeDir,
      'test/parse.test.js',
      'it.skip("returns null for missing input", () => {});\n',
    );

    await expect(
      protectedPathsIntact(originalDir, treeDir, ['test/parse.test.js']),
    ).resolves.toBe(false);
  });

  it('fails when bytes differ although their decoded text collides', async () => {
    await writeFile(join(originalDir, 'test/parse.test.js'), Buffer.from([0xff]));
    await mkdir(dirname(join(treeDir, 'test/parse.test.js')), {
      recursive: true,
    });
    await writeFile(join(treeDir, 'test/parse.test.js'), Buffer.from([0xfe]));

    await expect(
      protectedPathsIntact(originalDir, treeDir, ['test/parse.test.js']),
    ).resolves.toBe(false);
  });

  it('fails when a protected file is missing from the post-run tree', async () => {
    await expect(
      protectedPathsIntact(originalDir, treeDir, ['test/parse.test.js']),
    ).resolves.toBe(false);
  });

  it('holds trivially when no path is protected', async () => {
    await expect(protectedPathsIntact(originalDir, treeDir, [])).resolves.toBe(
      true,
    );
  });
});
