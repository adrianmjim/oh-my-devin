import { describe, expect, it } from 'vitest';
import type { CommandRunner } from '../engine/command-runner';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import type { CouncilSeat } from '../council/council-seat';
import { createProposerAction } from './create-proposer-action';
import { DeliberationError } from './deliberation-error';
import type { ProposerAction } from './proposer-action';
import type { SeatSessionDeps } from './seat-session-deps';

class FakeWorktrees implements WorktreeProvisioner {
  public readonly created: string[] = [];
  public readonly removed: string[] = [];

  public create(instanceId: string): Promise<Worktree> {
    this.created.push(instanceId);
    return Promise.resolve({ instanceId, path: `/wt/${instanceId}` });
  }

  public captureDiff(): Promise<string> {
    return Promise.resolve('');
  }

  public remove(worktree: Worktree): Promise<void> {
    this.removed.push(worktree.instanceId);
    return Promise.resolve();
  }
}

const NOOP_RUNNER: CommandRunner = {
  run: (): Promise<never> => Promise.reject(new Error('unused')),
};

const PROPOSER: CouncilSeat = {
  role: 'architect',
  lens: 'design',
  proposer: true,
  contrarian: false,
  model: null,
};

function report(overrides: Partial<RunReport> = {}): RunReport {
  return {
    role: 'architect',
    task: 't',
    engine: 'devin-headless',
    sessionId: 's',
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 6,
    wallTimeMs: 0,
    artifactPath: 'proposal.json',
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
  read: (path: string) => Promise<string>,
): SeatSessionDeps {
  return {
    worktrees,
    runRole,
    runnerFor: (): CommandRunner => NOOP_RUNNER,
    readArtifact: read,
    clock: (): number => 0,
  };
}

describe('createProposerAction', () => {
  it('drafts a fresh proposal when there is none, returning its text', async () => {
    const worktrees = new FakeWorktrees();
    let task: string = '';
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          task = options.task;
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> =>
          Promise.resolve(JSON.stringify({ proposal: 'do the thing' })),
      ),
    );

    const proposal: string = await propose({
      seat: PROPOSER,
      question: 'what should we build?',
      currentProposal: null,
      blocking: [],
    });

    expect(proposal).toBe('do the thing');
    expect(task.toLowerCase()).toContain('draft');
    expect(worktrees.created).toEqual(['proposer-architect']);
    expect(worktrees.removed).toEqual(['proposer-architect']);
  });

  it('revises an existing proposal against blocking objections', async () => {
    const worktrees = new FakeWorktrees();
    let task: string = '';
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          task = options.task;
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> =>
          Promise.resolve(JSON.stringify({ proposal: 'revised' })),
      ),
    );

    await propose({
      seat: PROPOSER,
      question: 'q',
      currentProposal: 'v1',
      blocking: [
        {
          seat: 'security',
          lens: 'threat',
          kind: 'objection',
          domain: 'auth',
          severity: 'high',
          concern: 'token leak',
        },
      ],
    });

    expect(task.toLowerCase()).toContain('revise');
    expect(task).toContain('token leak');
  });

  it('throws when the proposer produces no valid proposal', async () => {
    const worktrees = new FakeWorktrees();
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (): Promise<RunReport> => Promise.resolve(report()),
        worktrees,
        (): Promise<string> => Promise.resolve(JSON.stringify({ notes: 'x' })),
      ),
    );

    await expect(
      propose({
        seat: PROPOSER,
        question: 'q',
        currentProposal: null,
        blocking: [],
      }),
    ).rejects.toThrow(DeliberationError);
  });
});
