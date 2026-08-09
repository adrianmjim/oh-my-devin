import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import { readStagedRules } from './read-staged-rules';
import type { StagedRule } from './staged-rule';
import { writeStagedRules } from './write-staged-rules';

const RULE: StagedRule = {
  text: 'the data owner reviews migrations',
  hash: 'abc',
  sessionId: 'sess-1',
  stagedAt: 100,
  deliveredAt: null,
};

describe('writeStagedRules', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-rules-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('stages a rule the reader reads back', async () => {
    await writeStagedRules(projectDir, [RULE]);

    expect(await readStagedRules(projectDir)).toEqual([RULE]);
  });

  it('never writes the durable memory store', async () => {
    await writeStagedRules(projectDir, [RULE]);

    await expect(
      readdir(new MemoryStorePaths(projectDir).dir),
    ).rejects.toThrow();
  });
});
