import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readRules } from './read-rules';
import type { RuleEntry } from './rule-entry';
import { writeRules } from './write-rules';

const RULE: RuleEntry = {
  text: 'the data owner reviews migrations',
  globs: ['db/migrations/**'],
  hash: 'abc',
  recordedAt: 5,
};

describe('writeRules', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-rules-class-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('writes the class the reader reads back', async () => {
    await writeRules(projectDir, [RULE]);

    expect(await readRules(projectDir)).toEqual([RULE]);
  });
});
