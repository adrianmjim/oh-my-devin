import { describe, expect, it } from 'vitest';
import type { CommandRunner } from '../engine/command-runner';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import type { CouncilSeat } from '../council/council-seat';
import { createProposerAction } from './create-proposer-action';
import { DeliberationError } from './deliberation-error';
import type { ProposerAction } from './proposer-action';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
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
  id: 'architect',
  role: 'architect',
  lens: 'design',
  proposer: true,
  contrarian: false,
  model: null,
};

function report(overrides: Partial<RunReport> = {}): RunReport {
  return {
    runId: 'run-proposer',
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
  runProposerRole: (options: RunRoleOptions) => Promise<RunReport>,
  worktrees: FakeWorktrees,
  read: (path: string) => Promise<string>,
): SeatSessionDeps {
  return {
    worktrees,
    runRole: runProposerRole,
    runnerFor: (): CommandRunner => NOOP_RUNNER,
    readArtifact: read,
    clock: (): number => 0,
  };
}

function request(overrides: Partial<ProposerRequest> = {}): ProposerRequest {
  return {
    seat: PROPOSER,
    question: 'what should we build?',
    currentProposal: null,
    blocking: [],
    clarificationQuestions: [],
    ...overrides,
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
      new WorktreePool(worktrees),
    );

    const result: ProposerResult = await propose(request({}));

    expect(result.proposal).toBe('do the thing');
    expect(result.clarifications).toEqual([]);
    expect(task.toLowerCase()).toContain('draft');
    expect(worktrees.created).toEqual(['seat-architect']);
  });

  it('keeps the proposer worktree alive across consecutive requests', async () => {
    const worktrees = new FakeWorktrees();
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (): Promise<RunReport> => Promise.resolve(report()),
        worktrees,
        (): Promise<string> =>
          Promise.resolve(JSON.stringify({ proposal: 'v1' })),
      ),
      new WorktreePool(worktrees),
    );

    await propose(request({}));
    await propose(request({ currentProposal: 'v1' }));

    expect(worktrees.created).toEqual(['seat-architect']);
    expect(worktrees.removed).toEqual([]);
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
      new WorktreePool(worktrees),
    );

    await propose(
      request({
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
            assumptions: [],
            reconsiderWhen: [],
          },
        ],
      }),
    );

    expect(task.toLowerCase()).toContain('revise');
    expect(task).toContain('token leak');
  });

  it('answers posed clarification questions about the current proposal', async () => {
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
          Promise.resolve(
            JSON.stringify({
              proposal: 'v1',
              clarifications: [
                { question: 'what is the rollout plan?', answer: 'canary' },
              ],
            }),
          ),
      ),
      new WorktreePool(worktrees),
    );

    const result: ProposerResult = await propose(
      request({
        currentProposal: 'v1',
        clarificationQuestions: ['what is the rollout plan?'],
      }),
    );

    expect(task.toLowerCase()).toContain('answer');
    expect(task).toContain('what is the rollout plan?');
    expect(result.clarifications).toEqual([
      { question: 'what is the rollout plan?', answer: 'canary' },
    ]);
  });

  it('keys the proposer worktree by the seat instance id', async () => {
    const worktrees = new FakeWorktrees();
    const seen: RunRoleOptions[] = [];
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          seen.push(options);
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> =>
          Promise.resolve(JSON.stringify({ proposal: 'v1' })),
      ),
      new WorktreePool(worktrees),
    );

    await propose(request({ seat: { ...PROPOSER, id: 'architect-2' } }));

    expect(worktrees.created).toEqual(['seat-architect-2']);
    expect(seen[0]?.roleName).toBe('architect');
    expect(seen[0]?.workingDirectory).toBe('/wt/seat-architect-2');
  });

  it('names the seat instance id when the proposer fails', async () => {
    const worktrees = new FakeWorktrees();
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (): Promise<RunReport> =>
          Promise.resolve(
            report({ failureTier: 'invalid_artifact', artifactValid: false }),
          ),
        worktrees,
        (): Promise<string> => Promise.resolve(JSON.stringify({})),
      ),
      new WorktreePool(worktrees),
    );

    await expect(
      propose(request({ seat: { ...PROPOSER, id: 'architect-2' } })),
    ).rejects.toThrow(/architect-2/);
  });

  it('rejects a malformed clarifications answer shape', async () => {
    const worktrees = new FakeWorktrees();
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (): Promise<RunReport> => Promise.resolve(report()),
        worktrees,
        (): Promise<string> =>
          Promise.resolve(
            JSON.stringify({ proposal: 'v1', clarifications: [{ q: 'x' }] }),
          ),
      ),
      new WorktreePool(worktrees),
    );

    await expect(
      propose(request({ clarificationQuestions: ['x'] })),
    ).rejects.toThrow(DeliberationError);
  });

  it('throws when the proposer produces no valid proposal', async () => {
    const worktrees = new FakeWorktrees();
    const propose: ProposerAction = createProposerAction(
      makeDeps(
        (): Promise<RunReport> => Promise.resolve(report()),
        worktrees,
        (): Promise<string> => Promise.resolve(JSON.stringify({ notes: 'x' })),
      ),
      new WorktreePool(worktrees),
    );

    await expect(propose(request({}))).rejects.toThrow(DeliberationError);
  });
});
