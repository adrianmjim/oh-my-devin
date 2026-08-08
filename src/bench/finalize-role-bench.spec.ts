import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchBaseline } from './bench-baseline';
import { finalizeRoleBench } from './finalize-role-bench';
import type { RoleBenchScore } from './role-bench-score';
import { roleAgentMd } from './role-agent-md';
import { rolePromptDigest } from './role-prompt-digest';

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
  ],
  composite: 1,
};

describe('finalizeRoleBench', () => {
  let root: string;
  let resultsDir: string;
  let baselinesDir: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'omd-bench-finalize-'));
    resultsDir = join(root, 'bench-results');
    baselinesDir = join(root, 'baselines');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('always writes the run results', async () => {
    const path: string = await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop'],
      mode: 'dry',
      env: {},
      resultsDir,
      baselinesDir,
    });

    expect(path).toBe(join(resultsDir, 'reviewer.dry.json'));
    await expect(readFile(path, 'utf8')).resolves.toContain('reviewer');
  });

  it('writes no baseline without the save opt-in', async () => {
    await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop'],
      mode: 'real',
      env: {},
      resultsDir,
      baselinesDir,
    });

    await expect(readdir(baselinesDir)).rejects.toThrow();
  });

  it('writes no baseline from a dry run even with the save opt-in', async () => {
    await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop'],
      mode: 'dry',
      env: { OMD_BENCH_SAVE: '1' },
      resultsDir,
      baselinesDir,
    });

    await expect(readdir(baselinesDir)).rejects.toThrow();
  });

  it('saves a baseline naming every variable on a real saved run', async () => {
    await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop'],
      mode: 'real',
      env: { OMD_BENCH_SAVE: '1' },
      resultsDir,
      baselinesDir,
    });

    const baseline: BenchBaseline = JSON.parse(
      await readFile(join(baselinesDir, 'reviewer.json'), 'utf8'),
    ) as BenchBaseline;
    expect(baseline.promptDigest).toBe(rolePromptDigest(roleAgentMd('reviewer')));
    expect(baseline.model).toBe('claude-sonnet-5-medium');
    expect(baseline.omdVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(baseline.engineVersion).not.toBe('');
    expect(baseline.composite).toBe(1);
  });

  it('saves a baseline when the save opt-in carries incidental whitespace', async () => {
    await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop'],
      mode: 'real',
      env: { OMD_BENCH_SAVE: ' 1 ' },
      resultsDir,
      baselinesDir,
    });

    await expect(
      readFile(join(baselinesDir, 'reviewer.json'), 'utf8'),
    ).resolves.toContain('reviewer');
  });

  it('saves no baseline when the run scored only part of the fixture set', async () => {
    await finalizeRoleBench({
      score: SCORE,
      expectedFixtureIds: ['unbounded-loop', 'silent-catch'],
      mode: 'real',
      env: { OMD_BENCH_SAVE: '1' },
      resultsDir,
      baselinesDir,
    });

    await expect(readdir(baselinesDir)).rejects.toThrow();
  });
});
