import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchBaseline } from './bench-baseline';
import type { RoleBenchScore } from './role-bench-score';
import { saveBaseline } from './save-baseline';

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
  ],
  composite: 1,
};

describe('saveBaseline', () => {
  let baselinesDir: string;

  beforeEach(async () => {
    baselinesDir = await mkdtemp(join(tmpdir(), 'omd-bench-baselines-'));
  });

  afterEach(async () => {
    await rm(baselinesDir, { recursive: true, force: true });
  });

  it('writes the scores with every variable that moves them', async () => {
    const path: string | null = await saveBaseline({
      score: SCORE,
      promptDigest: 'abc123',
      omdVersion: '0.1.0',
      engineVersion: '3000.3.27',
      baselinesDir,
      requested: true,
    });

    expect(path).toBe(join(baselinesDir, 'reviewer.json'));
    const baseline: BenchBaseline = JSON.parse(
      await readFile(path ?? '', 'utf8'),
    ) as BenchBaseline;
    expect(baseline).toEqual({
      role: 'reviewer',
      promptDigest: 'abc123',
      omdVersion: '0.1.0',
      engineVersion: '3000.3.27',
      model: 'claude-sonnet-5-medium',
      fixtures: SCORE.fixtures,
      composite: 1,
    });
  });

  it('writes nothing at all without the save opt-in', async () => {
    const path: string | null = await saveBaseline({
      score: SCORE,
      promptDigest: 'abc123',
      omdVersion: '0.1.0',
      engineVersion: '3000.3.27',
      baselinesDir,
      requested: false,
    });

    expect(path).toBeNull();
    await expect(readdir(baselinesDir)).resolves.toEqual([]);
  });

  it('writes nothing when the run scored no fixtures', async () => {
    const path: string | null = await saveBaseline({
      score: { ...SCORE, fixtures: [], composite: 0 },
      promptDigest: 'abc123',
      omdVersion: '0.1.0',
      engineVersion: '3000.3.27',
      baselinesDir,
      requested: true,
    });

    expect(path).toBeNull();
    await expect(readdir(baselinesDir)).resolves.toEqual([]);
  });

  it('creates the baselines directory on the first saved run', async () => {
    const nested: string = join(baselinesDir, 'first');

    const path: string | null = await saveBaseline({
      score: SCORE,
      promptDigest: 'abc123',
      omdVersion: '0.1.0',
      engineVersion: '3000.3.27',
      baselinesDir: nested,
      requested: true,
    });

    expect(path).toBe(join(nested, 'reviewer.json'));
  });
});
