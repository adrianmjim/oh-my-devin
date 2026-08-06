import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { FailureTier } from '../outcome/failure-tier';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { BenchFixture } from './bench-fixture';
import type { FixtureScore } from './fixture-score';
import { runFixture } from './run-fixture';
import type { ScratchProject } from './scratch-project';

const MODEL: string = 'claude-sonnet-5-medium';

class CountingRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(invocation);
    return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 });
  }
}

function reportOf(
  artifactPath: string,
  artifactValid: boolean,
  failureTier: FailureTier | null = null,
  validationErrors: readonly string[] = [],
): RunReport {
  return {
    runId: 'run-1',
    role: 'reviewer',
    task: 'review',
    engine: 'devin',
    sessionId: 's1',
    failureTier,
    turnsUsed: 1,
    maxTurns: 6,
    wallTimeMs: 10,
    artifactPath,
    writeScope: 'artifact',
    artifactValid,
    validationErrors,
    denyRule: null,
    repairAttempted: false,
  };
}

describe('runFixture', () => {
  let scratchDir: string;
  let scratch: ScratchProject;
  let runner: CountingRunner;

  const reviewerFixture: BenchFixture = {
    id: 'unbounded-loop',
    role: 'reviewer',
    clean: false,
    dir: '/fixtures/reviewer/unbounded-loop',
    treeDir: '/fixtures/reviewer/unbounded-loop/tree',
    task: 'Review the diff.',
    truth: {
      role: 'reviewer',
      expectedVerdict: 'request_changes',
      defects: [
        { id: 'unbounded-loop', keywords: ['unbounded'], severity: 'high' },
      ],
    },
    sampleArtifact: JSON.stringify({
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
  };

  beforeEach(async () => {
    scratchDir = await mkdtemp(join(tmpdir(), 'omd-bench-run-fixture-'));
    scratch = {
      dir: scratchDir,
      cleanup: async (): Promise<void> => {
        await rm(scratchDir, { recursive: true, force: true });
      },
    };
    runner = new CountingRunner();
  });

  afterEach(async () => {
    await rm(scratchDir, { recursive: true, force: true });
  });

  it('scores the recorded sample artifact on the dry path', async () => {
    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'dry',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> => {
        throw new Error('the dry path must not run a role');
      },
      runner,
      clock: (): number => 0,
    });

    expect(score.fixtureId).toBe('unbounded-loop');
    expect(score.role).toBe('reviewer');
    expect(score.composite).toBe(1);
  });

  it('launches nothing on the dry path', async () => {
    let calls: number = 0;

    await runFixture({
      fixture: reviewerFixture,
      mode: 'dry',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> => {
        calls += 1;
        return Promise.resolve(reportOf('review.json', true));
      },
      runner,
      clock: (): number => 0,
    });

    expect(calls).toBe(0);
    expect(runner.invocations).toEqual([]);
  });

  it('invokes the run surface once with the fixture task and the bench model', async () => {
    await writeFile(
      join(scratchDir, 'review.json'),
      reviewerFixture.sampleArtifact,
      'utf8',
    );
    const seen: RunRoleOptions[] = [];

    await runFixture({
      fixture: reviewerFixture,
      mode: 'real',
      model: MODEL,
      scratch,
      run: (options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options);
        return Promise.resolve(reportOf('review.json', true));
      },
      runner,
      clock: (): number => 7,
    });

    expect(seen).toHaveLength(1);
    expect(seen[0]?.roleName).toBe('reviewer');
    expect(seen[0]?.task).toBe('Review the diff.');
    expect(seen[0]?.model).toBe(MODEL);
    expect(seen[0]?.workingDirectory).toBe(scratchDir);
    expect(seen[0]?.runner).toBe(runner);
  });

  it('passes a per-run model override through to the run surface and the result', async () => {
    await writeFile(
      join(scratchDir, 'review.json'),
      reviewerFixture.sampleArtifact,
      'utf8',
    );
    let used: string | null = null;

    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'real',
      model: 'claude-opus-5-high',
      scratch,
      run: (options: RunRoleOptions): Promise<RunReport> => {
        used = options.model;
        return Promise.resolve(reportOf('review.json', true));
      },
      runner,
      clock: (): number => 0,
    });

    expect(used).toBe('claude-opus-5-high');
    expect(score.model).toBe('claude-opus-5-high');
  });

  it('records the model used on the dry path too', async () => {
    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'dry',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> => {
        throw new Error('unused');
      },
      runner,
      clock: (): number => 0,
    });

    expect(score.model).toBe(MODEL);
  });

  it('asserts the scratch copy as the provisioned isolation for the executor', async () => {
    await mkdir(join(scratchDir, 'src'), { recursive: true });
    await writeFile(join(scratchDir, 'src', 'parse.js'), 'input == null\n', 'utf8');
    await writeFile(
      join(scratchDir, 'evidence.json'),
      JSON.stringify({
        tests: 'passed',
        commands: [{ command: 'node --test', result: 'guard covered' }],
      }),
      'utf8',
    );
    const seen: RunRoleOptions[] = [];

    const score: FixtureScore = await runFixture({
      fixture: {
        id: 'add-guard',
        role: 'executor',
        clean: false,
        dir: '/fixtures/executor/add-guard',
        treeDir: '/fixtures/executor/add-guard/tree',
        task: 'Add the guard.',
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
        sampleArtifact: '{}',
      },
      mode: 'real',
      model: MODEL,
      scratch,
      run: (options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options);
        return Promise.resolve(reportOf('evidence.json', true));
      },
      runner,
      clock: (): number => 0,
    });

    expect(seen[0]?.provisionedWorktree).toBe(true);
    expect(score.composite).toBe(1);
  });

  it('scores a run whose artifact failed validation as zero', async () => {
    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'real',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> =>
        Promise.resolve(reportOf('review.json', false)),
      runner,
      clock: (): number => 0,
    });

    expect(score.composite).toBe(0);
    expect(score.dimensions.every((entry) => entry.score === 0)).toBe(true);
  });

  it('records why a real run produced no valid artifact', async () => {
    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'real',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> =>
        Promise.resolve(
          reportOf('review.json', false, 'invalid_artifact', [
            'findings must be an array',
          ]),
        ),
      runner,
      clock: (): number => 0,
    });

    expect(score.failureTier).toBe('invalid_artifact');
    expect(score.validationErrors).toEqual(['findings must be an array']);
  });

  it('carries no failure detail on the dry path', async () => {
    const score: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'dry',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> => {
        throw new Error('unused');
      },
      runner,
      clock: (): number => 0,
    });

    expect(score.failureTier).toBeNull();
    expect(score.validationErrors).toEqual([]);
  });

  it('separates a zero earned by scoring from one caused by a missing artifact', async () => {
    const unscored: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'real',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> =>
        Promise.resolve(reportOf('review.json', false)),
      runner,
      clock: (): number => 0,
    });

    const scored: FixtureScore = await runFixture({
      fixture: reviewerFixture,
      mode: 'dry',
      model: MODEL,
      scratch,
      run: (): Promise<RunReport> =>
        Promise.resolve(reportOf('review.json', true)),
      runner,
      clock: (): number => 0,
    });

    expect(unscored.artifactValid).toBe(false);
    expect(scored.artifactValid).toBe(true);
  });
});
