import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { BenchFixture } from './bench-fixture';
import { BenchFixtureError } from './bench-fixture-error';
import type { BenchDimension } from './bench-dimension';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreFixture } from './score-fixture';

function fixtureOf(fixture: Partial<BenchFixture>): BenchFixture {
  return {
    id: 'case',
    role: 'reviewer',
    clean: false,
    dir: '/nowhere',
    treeDir: '/nowhere/tree',
    task: 'do it',
    truth: { role: 'reviewer', expectedVerdict: 'approve', defects: [] },
    sampleArtifact: '{}',
    ...fixture,
  };
}

const RUNNER: CommandRunner = {
  run: (): Promise<CommandResult> =>
    Promise.resolve({ stdout: '', stderr: '', exitCode: 0 }),
};

describe('scoreFixture', () => {
  let treeDir: string;

  beforeEach(async () => {
    treeDir = await mkdtemp(join(tmpdir(), 'omd-bench-score-fixture-'));
  });

  afterEach(async () => {
    await rm(treeDir, { recursive: true, force: true });
  });

  it('scores a reviewer artifact through the reviewer scorer', async () => {
    const scores: readonly DimensionScore[] = await scoreFixture(
      fixtureOf({
        truth: {
          role: 'reviewer',
          expectedVerdict: 'request_changes',
          defects: [
            { id: 'unbounded-loop', keywords: ['unbounded'], severity: 'high' },
          ],
        },
      }),
      JSON.stringify({
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            location: 'loop.js:1',
            summary: 'the loop is unbounded',
            fix: 'bound it',
          },
        ],
      }),
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
      RUNNER,
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual([
      'detection',
      'false-positive-resistance',
      'severity-accuracy',
      'verdict-accuracy',
    ]);
  });

  it('scores an architect artifact through the architect scorer', async () => {
    const scores: readonly DimensionScore[] = await scoreFixture(
      fixtureOf({
        role: 'architect',
        truth: {
          role: 'architect',
          gaps: [{ id: 'no-migration', keywords: ['migration'] }],
          spurious: [],
        },
      }),
      JSON.stringify({
        approach: 'Add a migration',
        steps: [{ description: 'Write the migration' }],
      }),
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
      RUNNER,
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual(['gap-coverage', 'spurious-step-resistance']);
  });

  it('scores an executor artifact against the post-run tree', async () => {
    await mkdir(join(treeDir, 'src'), { recursive: true });
    await writeFile(join(treeDir, 'src', 'parse.js'), 'input == null\n', 'utf8');

    const scores: readonly DimensionScore[] = await scoreFixture(
      fixtureOf({
        role: 'executor',
        truth: {
          role: 'executor',
          expectedTests: 'passed',
          criteria: [
            {
              id: 'guard-added',
              keywords: ['guard'],
              path: 'src/parse.js',
              contains: ['input == null'],
            },
          ],
          verification: { command: 'node', args: ['--test'] },
          protectedPaths: [],
        },
      }),
      JSON.stringify({
        tests: 'passed',
        commands: [{ command: 'node --test', result: 'guard covered' }],
      }),
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
      RUNNER,
    );

    expect(scores).toEqual([
      { dimension: 'criteria-satisfaction', score: 1 },
      { dimension: 'verification-outcome', score: 1 },
      { dimension: 'test-integrity', score: 1 },
      { dimension: 'evidence-accuracy', score: 1 },
    ]);
  });

  it('rejects an artifact that does not match its role schema', async () => {
    await expect(
      scoreFixture(
        fixtureOf({}),
        JSON.stringify({ approach: 'wrong artifact' }),
        treeDir,
        KEYWORD_MATCH_THRESHOLD,
        RUNNER,
      ),
    ).rejects.toThrow(BenchFixtureError);
  });
});
