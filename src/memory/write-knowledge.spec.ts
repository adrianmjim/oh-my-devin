import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { KnowledgeEntry } from './knowledge-entry';
import { readKnowledge } from './read-knowledge';
import { writeKnowledge } from './write-knowledge';

const ENTRY: KnowledgeEntry = {
  text: 'the release gate is manual',
  triggers: ['release'],
  hash: 'abc',
  recordedAt: 5,
};

describe('writeKnowledge', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-knowledge-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('writes the class the reader reads back', async () => {
    await writeKnowledge(projectDir, [ENTRY]);

    expect(await readKnowledge(projectDir)).toEqual([ENTRY]);
  });

  it('writes an empty class without failing', async () => {
    await writeKnowledge(projectDir, []);

    expect(await readKnowledge(projectDir)).toEqual([]);
  });
});
