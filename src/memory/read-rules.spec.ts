import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from './memory-store-paths';
import { readRules } from './read-rules';
import type { RuleEntry } from './rule-entry';

describe('readRules', () => {
  let projectDir: string;
  let paths: MemoryStorePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-rules-'));
    paths = new MemoryStorePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('reads an empty class from a store that was never written', async () => {
    expect(await readRules(projectDir)).toEqual([]);
  });

  it('reads the class back from the durable subtree', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(
      paths.rules,
      JSON.stringify([
        {
          text: 'migrations are reviewed by the data owner',
          globs: ['db/migrations/**'],
          hash: 'abc',
          recordedAt: 7,
        },
      ]),
      'utf8',
    );

    const entries: readonly RuleEntry[] = await readRules(projectDir);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.globs).toEqual(['db/migrations/**']);
  });

  it('drops entries omd does not recognize', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, JSON.stringify([{ text: 'no globs' }]), 'utf8');

    expect(await readRules(projectDir)).toEqual([]);
  });
});
