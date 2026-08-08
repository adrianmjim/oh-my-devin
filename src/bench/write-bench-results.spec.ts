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
      failureTier: null,
      validationErrors: [],
    },
    {
      fixtureId: 'clean-refactor',
      role: 'reviewer',
      model: 'claude-sonnet-5-medium',
      dimensions: [{ dimension: 'detection', score: 0.5 }],
      composite: 0.5,
      artifactValid: true,
      failureTier: null,
      validationErrors: [],
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
    const path: string = await writeBenchResults(SCORE, resultsDir, 'real');

    expect(path).toBe(join(resultsDir, 'reviewer.json'));
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(SCORE);
  });

  it('writes dry-run results beside the real results rather than over them', async () => {
    const realPath: string = await writeBenchResults(SCORE, resultsDir, 'real');
    const dryPath: string = await writeBenchResults(
      { ...SCORE, composite: 0.5 },
      resultsDir,
      'dry',
    );

    expect(dryPath).toBe(join(resultsDir, 'reviewer.dry.json'));
    const real: RoleBenchScore = JSON.parse(
      await readFile(realPath, 'utf8'),
    ) as RoleBenchScore;
    expect(real.composite).toBe(0.75);
  });

  it('records the model used on the role and on every fixture', async () => {
    const path: string = await writeBenchResults(SCORE, resultsDir, 'real');
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

    const path: string = await writeBenchResults(SCORE, nested, 'real');

    expect(path).toBe(join(nested, 'reviewer.json'));
    await expect(readFile(path, 'utf8')).resolves.toContain('reviewer');
  });

  it('writes newline-terminated JSON', async () => {
    const path: string = await writeBenchResults(SCORE, resultsDir, 'real');

    expect(await readFile(path, 'utf8')).toMatch(/\n$/);
  });
});
