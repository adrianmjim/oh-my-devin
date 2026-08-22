import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { KnowledgeEntry } from './knowledge-entry';
import { MemoryStorePaths } from './memory-store-paths';
import { readKnowledge } from './read-knowledge';

describe('readKnowledge', () => {
  let projectDir: string;
  let paths: MemoryStorePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-knowledge-'));
    paths = new MemoryStorePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('reads an empty class from a store that was never written', async () => {
    expect(await readKnowledge(projectDir)).toEqual([]);
  });

  it('reads the class back from the durable subtree', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(
      paths.knowledge,
      JSON.stringify([
        {
          text: 'the deploy gate is manual',
          triggers: ['deploy'],
          hash: 'abc',
          recordedAt: 7,
        },
      ]),
      'utf8',
    );

    const entries: readonly KnowledgeEntry[] = await readKnowledge(projectDir);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.triggers).toEqual(['deploy']);
  });

  it('degrades to an empty class on unreadable content', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.knowledge, '{ not json', 'utf8');

    expect(await readKnowledge(projectDir)).toEqual([]);
  });
});
