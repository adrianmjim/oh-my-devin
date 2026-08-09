import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DetectionStatePaths } from './detection-state-paths';
import { readStagedRules } from './read-staged-rules';

describe('readStagedRules', () => {
  let projectDir: string;
  let paths: DetectionStatePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-staged-rules-'));
    paths = new DetectionStatePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('reads empty staging from a project that staged none', async () => {
    expect(await readStagedRules(projectDir)).toEqual([]);
  });

  it('reads back the rules the staging holds', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(
      paths.rules,
      JSON.stringify([
        {
          text: 'the data owner reviews migrations',
          hash: 'abc',
          sessionId: 'sess-1',
          stagedAt: 100,
          deliveredAt: null,
        },
      ]),
      'utf8',
    );

    expect(await readStagedRules(projectDir)).toHaveLength(1);
  });

  it('degrades to empty staging on unreadable content', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, '{ not json', 'utf8');

    expect(await readStagedRules(projectDir)).toEqual([]);
  });
});
