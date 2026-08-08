import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { criterionSatisfied } from './criterion-satisfied';

describe('criterionSatisfied', () => {
  let treeDir: string;

  beforeEach(async () => {
    treeDir = await mkdtemp(join(tmpdir(), 'omd-bench-criterion-'));
    await mkdir(join(treeDir, 'src'), { recursive: true });
    await writeFile(
      join(treeDir, 'src', 'parse.js'),
      'function parse(input) {\n  if (input == null) return null;\n}\n',
      'utf8',
    );
  });

  afterEach(async () => {
    await rm(treeDir, { recursive: true, force: true });
  });

  it('is satisfied when the file carries every required fragment', async () => {
    await expect(
      criterionSatisfied(treeDir, {
        id: 'guard-added',
        keywords: ['guard'],
        path: 'src/parse.js',
        contains: ['input == null', 'return null'],
      }),
    ).resolves.toBe(true);
  });

  it('is unsatisfied when a required fragment is absent', async () => {
    await expect(
      criterionSatisfied(treeDir, {
        id: 'guard-added',
        keywords: ['guard'],
        path: 'src/parse.js',
        contains: ['throw new TypeError'],
      }),
    ).resolves.toBe(false);
  });

  it('is unsatisfied when the file does not exist', async () => {
    await expect(
      criterionSatisfied(treeDir, {
        id: 'file-created',
        keywords: ['create'],
        path: 'src/missing.js',
        contains: ['anything'],
      }),
    ).resolves.toBe(false);
  });

  it('matches fragments exactly rather than by normalized keyword', async () => {
    await expect(
      criterionSatisfied(treeDir, {
        id: 'guard-added',
        keywords: ['guard'],
        path: 'src/parse.js',
        contains: ['INPUT == NULL'],
      }),
    ).resolves.toBe(false);
  });
});
