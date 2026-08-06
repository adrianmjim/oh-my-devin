import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RoleBenchScore } from './role-bench-score';
import { writeBenchResults } from './write-bench-results';

const SCORE: RoleBenchScore = {
  role: 'reviewer',
  model: 'claude-sonnet-5-medium',
  hypothesis: 'The reviewer prompt makes severity track impact.',
  fixtures: [
    {
      fixtureId: 'unbounded-loop',
      role: 'reviewer',
      model: 'claude-sonnet-5-medium',
      dimensions: [{ dimension: 'detection', score: 1 }],
      composite: 1,
      artifactValid: true,
    },
    {
      fixtureId: 'clean-refactor',
      role: 'reviewer',
      model: 'claude-sonnet-5-medium',
      dimensions: [{ dimension: 'detection', score: 0.5 }],
      composite: 0.5,
      artifactValid: true,
    },
  ],
  composite: 0.75,
};

describe('writeBenchResults', () => {
  let resultsDir: string;

  beforeEach(async () => {
    resultsDir = await mkdtemp(join(tmpdir(), 'omd-bench-results-'));
  });

  afterEach(async () => {
    await rm(resultsDir, { recursive: true, force: true });
  });

  it('writes the per-role result under the results directory', async () => {
    const path: string = await writeBenchResults(SCORE, resultsDir);

    expect(path).toBe(join(resultsDir, 'reviewer.json'));
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(SCORE);
  });

  it('records the model used on the role and on every fixture', async () => {
    const path: string = await writeBenchResults(SCORE, resultsDir);
    const written: RoleBenchScore = JSON.parse(
      await readFile(path, 'utf8'),
    ) as RoleBenchScore;

    expect(written.model).toBe('claude-sonnet-5-medium');
    expect(
      written.fixtures.every(
        (fixture) => fixture.model === 'claude-sonnet-5-medium',
      ),
    ).toBe(true);
  });

  it('creates the results directory when it does not exist yet', async () => {
    const nested: string = join(resultsDir, 'deep', 'nested');

    const path: string = await writeBenchResults(SCORE, nested);

    expect(path).toBe(join(nested, 'reviewer.json'));
    await expect(readFile(path, 'utf8')).resolves.toContain('reviewer');
  });

  it('writes newline-terminated JSON', async () => {
    const path: string = await writeBenchResults(SCORE, resultsDir);

    expect(await readFile(path, 'utf8')).toMatch(/\n$/);
  });
});
