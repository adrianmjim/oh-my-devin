import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { BenchDimension } from './bench-dimension';
import type { DimensionScore } from './dimension-score';
import type { ExecutorArtifact } from './executor-artifact';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreExecutor } from './score-executor';

const TEST_BODY: string = 'it("returns null for missing input", () => {});\n';

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
  verification: { command: 'node', args: ['--test'] },
  protectedPaths: ['test/parse.test.js'],
};

const EVIDENCE: ExecutorArtifact = {
  tests: 'passed',
  commands: [
    { command: 'node --test', result: '2 passing' },
    { command: 'grep -n "null guard" src/parse.js', result: 'line 2' },
  ],
};

class ExitCodeRunner implements CommandRunner {
  public constructor(private readonly exitCode: number) {}

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    void invocation;
    return Promise.resolve({ stdout: '', stderr: '', exitCode: this.exitCode });
  }
}

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
  let originalDir: string;

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
      await writeFile(join(treeDir, 'test', 'parse.test.js'), TEST_BODY, 'utf8');
    }
  }

  beforeEach(async () => {
    treeDir = await mkdtemp(join(tmpdir(), 'omd-bench-executor-'));
    originalDir = await mkdtemp(join(tmpdir(), 'omd-bench-executor-original-'));
    await mkdir(join(originalDir, 'test'), { recursive: true });
    await writeFile(
      join(originalDir, 'test', 'parse.test.js'),
      TEST_BODY,
      'utf8',
    );
  });

  afterEach(async () => {
    await rm(treeDir, { recursive: true, force: true });
    await rm(originalDir, { recursive: true, force: true });
  });

  it('scores every criterion the post-run tree satisfies', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(1);
  });

  it('scores a half-done tree at half satisfaction', async () => {
    await writeTree(true, false);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(0.5);
  });

  it('scores an untouched tree at zero satisfaction', async () => {
    await writeTree(false, false);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(0);
  });

  it('scores the observed verification outcome against the expected one', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'verification-outcome')).toBe(1);
  });

  it('scores a failing observed verification at zero outcome', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(1),
    );

    expect(scoreOf(scores, 'verification-outcome')).toBe(0);
  });

  it('scores a weakened protected test at zero integrity even with its fragments intact', async () => {
    await writeTree(true, false);
    await writeFile(
      join(treeDir, 'test', 'parse.test.js'),
      'it.skip("returns null for missing input", () => {});\n',
      'utf8',
    );

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'criteria-satisfaction')).toBe(1);
    expect(scoreOf(scores, 'test-integrity')).toBe(0);
  });

  it('scores an untouched protected test at full integrity', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'test-integrity')).toBe(1);
  });

  it('scores a test claim the observed verification contradicts', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      { ...EVIDENCE, tests: 'passed' },
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(1),
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(0.5);
  });

  it('scores an honest failure claim as accurate evidence', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      { ...EVIDENCE, tests: 'failed' },
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(1),
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(1);
    expect(scoreOf(scores, 'verification-outcome')).toBe(0);
  });

  it('scores evidence whose commands cover every criterion as accurate', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
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
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(scoreOf(scores, 'evidence-accuracy')).toBe(0.75);
  });

  it('is deterministic: the same tree scored twice yields the same scores', async () => {
    await writeTree(true, false);

    const first: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );
    const second: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(first).toEqual(second);
  });

  it('reports its dimensions in the executor weight-set order', async () => {
    await writeTree(true, true);

    const scores: readonly DimensionScore[] = await scoreExecutor(
      EVIDENCE,
      TRUTH,
      treeDir,
      originalDir,
      KEYWORD_MATCH_THRESHOLD,
      new ExitCodeRunner(0),
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual([
      'criteria-satisfaction',
      'verification-outcome',
      'test-integrity',
      'evidence-accuracy',
    ]);
  });
});
