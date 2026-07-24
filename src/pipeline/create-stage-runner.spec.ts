import { describe, expect, it } from 'vitest';
import type { CommandRunner } from '../engine/command-runner';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import { createStageRunner } from './create-stage-runner';
import type { StageResult } from './stage-result';
import type { StageRunner } from './stage-runner';
import type { StageRunnerDeps } from './stage-runner-deps';

class FakeWorktrees implements WorktreeProvisioner {
  public readonly created: string[] = [];
  public readonly removed: string[] = [];
  public captureCalls: number = 0;

  public create(instanceId: string): Promise<Worktree> {
    this.created.push(instanceId);
    return Promise.resolve({ instanceId, path: `/wt/${instanceId}` });
  }

  public captureDiff(worktree: Worktree): Promise<string> {
    this.captureCalls += 1;
    return Promise.resolve(`DIFF(${worktree.instanceId})`);
  }

  public remove(worktree: Worktree): Promise<void> {
    this.removed.push(worktree.instanceId);
    return Promise.resolve();
  }
}

const NOOP_RUNNER: CommandRunner = {
  run: (): Promise<never> =>
    Promise.reject(new Error('runner should not be used directly')),
};

function reportFor(
  stage: PipelineStage,
  overrides: Partial<RunReport> = {},
): RunReport {
  return {
    runId: `run-${stage}`,
    role: stage,
    task: 't',
    engine: 'devin-headless',
    sessionId: `s-${stage}`,
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 8,
    wallTimeMs: 0,
    artifactPath: `${stage}-out.json`,
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

function makeDeps(
  runRole: (options: RunRoleOptions) => Promise<RunReport>,
  worktrees: FakeWorktrees,
  readArtifact: (path: string) => Promise<string> = (
    path: string,
  ): Promise<string> => Promise.resolve(`READ(${path})`),
): StageRunnerDeps {
  return {
    worktrees,
    runRole,
    runnerFor: (): CommandRunner => NOOP_RUNNER,
    readArtifact,
    clock: (): number => 0,
  };
}

function inputs(
  entries: readonly [HandoffArtifactName, string][],
): ReadonlyMap<HandoffArtifactName, string> {
  return new Map<HandoffArtifactName, string>(entries);
}

describe('createStageRunner', () => {
  it('runs the stage role in its own worktree and returns the role-produced artifact', async () => {
    const worktrees = new FakeWorktrees();
    const seen: RunRoleOptions[] = [];
    const runStage: StageRunner = createStageRunner(
      makeDeps((options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options);
        return Promise.resolve(
          reportFor('architect', { artifactPath: 'architecture.json' }),
        );
      }, worktrees),
    );

    const result: StageResult = await runStage({
      stage: 'architect',
      inputs: inputs([['requirements', 'build X']]),
    });

    expect(worktrees.created).toEqual(['architect']);
    expect(seen[0]?.roleName).toBe('architect');
    expect(seen[0]?.workingDirectory).toBe('/wt/architect');
    expect(seen[0]?.task).toContain('build X');
    expect([...result.produced.keys()]).toEqual(['architecture.json']);
    expect(result.produced.get('architecture.json')).toBe(
      'READ(/wt/architect/architecture.json)',
    );
    expect(worktrees.removed).toEqual(['architect']);
  });

  it('captures the executor diff alongside its evidence artifact', async () => {
    const worktrees = new FakeWorktrees();
    const runStage: StageRunner = createStageRunner(
      makeDeps(
        (): Promise<RunReport> =>
          Promise.resolve(
            reportFor('executor', { artifactPath: 'evidence.json' }),
          ),
        worktrees,
      ),
    );

    const result: StageResult = await runStage({
      stage: 'executor',
      inputs: inputs([
        ['requirements', 'r'],
        ['architecture.json', 'A'],
      ]),
    });

    expect([...result.produced.keys()]).toEqual(['evidence.json', 'diff']);
    expect(result.produced.get('diff')).toBe('DIFF(executor)');
    expect(worktrees.captureCalls).toBe(1);
  });

  it('produces only review.json for the reviewer and captures no diff', async () => {
    const worktrees = new FakeWorktrees();
    const runStage: StageRunner = createStageRunner(
      makeDeps(
        (): Promise<RunReport> =>
          Promise.resolve(
            reportFor('reviewer', { artifactPath: 'review.json' }),
          ),
        worktrees,
      ),
    );

    const result: StageResult = await runStage({
      stage: 'reviewer',
      inputs: inputs([
        ['requirements', 'r'],
        ['diff', 'D'],
        ['evidence.json', 'E'],
      ]),
    });

    expect([...result.produced.keys()]).toEqual(['review.json']);
    expect(worktrees.captureCalls).toBe(0);
  });

  it('composes the prompt from requirements and labeled handoff inputs', async () => {
    const worktrees = new FakeWorktrees();
    let task: string = '';
    const runStage: StageRunner = createStageRunner(
      makeDeps((options: RunRoleOptions): Promise<RunReport> => {
        task = options.task;
        return Promise.resolve(
          reportFor('executor', { artifactPath: 'evidence.json' }),
        );
      }, worktrees),
    );

    await runStage({
      stage: 'executor',
      inputs: inputs([
        ['requirements', 'REQ'],
        ['architecture.json', 'ARCH'],
      ]),
    });

    expect(task).toContain('REQ');
    expect(task).toContain('architecture.json');
    expect(task).toContain('ARCH');
  });

  it('returns no produced artifacts and still tears down the worktree when the stage fails', async () => {
    const worktrees = new FakeWorktrees();
    let reads: number = 0;
    const runStage: StageRunner = createStageRunner(
      makeDeps(
        (): Promise<RunReport> =>
          Promise.resolve(
            reportFor('executor', {
              failureTier: 'invalid_artifact',
              artifactValid: false,
            }),
          ),
        worktrees,
        (): Promise<string> => {
          reads += 1;
          return Promise.resolve('x');
        },
      ),
    );

    const result: StageResult = await runStage({
      stage: 'executor',
      inputs: inputs([
        ['requirements', 'r'],
        ['architecture.json', 'A'],
      ]),
    });

    expect(result.produced.size).toBe(0);
    expect(reads).toBe(0);
    expect(worktrees.captureCalls).toBe(0);
    expect(worktrees.removed).toEqual(['executor']);
  });
});
