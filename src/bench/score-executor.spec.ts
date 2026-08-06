import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchDimension } from './bench-dimension';
import type { DimensionScore } from './dimension-score';
import type { ExecutorArtifact } from './executor-artifact';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreExecutor } from './score-executor';

const TRUTH: ExecutorTruthDocument = {
  role: 'executor',
  expectedTests: 'passed',
  criteria: [
    {
      id: 'guard-added',
      keywords: ['guard', 'null'],
      path: 'src/parse.js',
      contains: ['input == null'],
    },
    {
      id: 'test-added',
      keywords: ['test'],
      path: 'test/parse.test.js',
      contains: ['returns null'],
    },
  ],
};

const EVIDENCE: ExecutorArtifact = {
  tests: 'passed',
  commands: [
    { command: 'node --test', result: '2 passing' },
    { command: 'grep -n "null guard" src/parse.js', result: 'line 2' },
  ],
};

function scoreOf(
  scores: readonly DimensionScore[],
  dimension: BenchDimension,
): number {
  return (
    scores.find(
      (score: DimensionScore): boolean => score.dimension === dimension,
    )?.score ?? Number.NaN
  );
}

describe('scoreExecutor', () => {
  let treeDir: string;

  async function writeTree(guard: boolean, test: boolean): Promise<void> {
    await mkdir(join(treeDir, 'src'), { recursive: true });
    await mkdir(join(treeDir, 'test'), { recursive: true });
    await writeFile(
      join(treeDir, 'src', 'parse.js'),
      guard
        ? 'function parse(input) {\n  if (input == null) return null;\n}\n'
        : 'function parse(input) {\n  return input.trim();\n}\n',
      'utf8',
    );
    if (test) {
      await writeFile(
        join(treeDir, 'test', 'parse.test.js'),
        'it("returns null for missing input", () => {});\n',
        'utf8',
      );
    }
  }

  beforeEach(async () => {
    treeDir = await mkdtemp(join(tmpdir(), 'omd-bench-executor-'));
  });

  afterEach(async () => {
    await rm(treeDir, { recursive: true, force: true });
  });

  it('scores every criterion the post-run tree satisfies', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(1);
  });

  it('scores a half-done tree at half satisfaction', async () => {
    await writeTree(true, false);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(0.5);
  });

  it('scores an untouched tree at zero satisfaction', async () => {
    await writeTree(false, false);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(0);
  });

  it('scores a test claim that contradicts the ground truth', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      { ...EVIDENCE, tests: 'failed' },
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(0.5);
  });

  it('scores evidence whose commands cover every criterion as accurate', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(1);
  });

  it('scores evidence that records no command for a criterion', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      {
        tests: 'passed',
        commands: [{ command: 'node --test', result: '2 passing' }],
      },
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(0.75);
  });

  it('is deterministic: the same tree scored twice yields the same scores', async () => {
    await writeTree(true, false);

    const first: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );
    const second: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(first).toEqual(second);
  });

  it('reports its dimensions in the executor weight-set order', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual(['criteria-satisfaction', 'evidence-accuracy']);
  });
});
