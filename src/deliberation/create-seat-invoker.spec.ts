import { describe, expect, it } from 'vitest';
import type { CommandRunner } from '../engine/command-runner';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { createSeatInvoker } from './create-seat-invoker';
import type { SeatInvocation } from './seat-invocation';
import type { SeatInvoker } from './seat-invoker';
import type { SeatSessionDeps } from './seat-session-deps';
import type { TypedPosition } from './typed-position';

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

const SEAT: CouncilSeat = {
  role: 'security',
  lens: 'threat-model',
  proposer: false,
  contrarian: false,
  model: null,
};

function report(overrides: Partial<RunReport> = {}): RunReport {
  return {
    role: 'security',
    task: 't',
    engine: 'devin-headless',
    sessionId: 's',
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 6,
    wallTimeMs: 0,
    artifactPath: 'position.json',
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

const POSITION_JSON: string = JSON.stringify({
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'token leak',
});

describe('createSeatInvoker', () => {
  it('runs the seat role in a worktree and maps its position artifact', async () => {
    const worktrees = new FakeWorktrees();
    const seen: RunRoleOptions[] = [];
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          seen.push(options);
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
    );

    const invocation: SeatInvocation = {
      seat: SEAT,
      proposal: 'ship the plan',
      priorArguments: [
        { kind: 'preference', domain: 'ux', severity: 'low', concern: 'copy' },
      ],
    };
    const position: TypedPosition = await invoke(invocation);

    expect(worktrees.created).toEqual(['seat-security']);
    expect(seen[0]?.roleName).toBe('security');
    expect(seen[0]?.workingDirectory).toBe('/wt/seat-security');
    expect(seen[0]?.task).toContain('threat-model');
    expect(seen[0]?.task).toContain('ship the plan');
    expect(seen[0]?.task).toContain('copy');
    expect(position.seat).toBe('security');
    expect(position.lens).toBe('threat-model');
    expect(position.kind).toBe('objection');
    expect(worktrees.removed).toEqual(['seat-security']);
  });

  it('instructs the contrarian seat to surface an objection', async () => {
    const worktrees = new FakeWorktrees();
    let task: string = '';
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          task = options.task;
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
    );

    await invoke({
      seat: { ...SEAT, contrarian: true },
      proposal: 'ship it',
      priorArguments: [],
    });

    expect(task.toLowerCase()).toContain('contrarian');
  });

  it('throws and tears down the worktree when the seat session fails', async () => {
    const worktrees = new FakeWorktrees();
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        (): Promise<RunReport> =>
          Promise.resolve(
            report({ failureTier: 'invalid_artifact', artifactValid: false }),
          ),
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
    );

    await expect(
      invoke({ seat: SEAT, proposal: 'x', priorArguments: [] }),
    ).rejects.toThrow(DeliberationError);
    expect(worktrees.removed).toEqual(['seat-security']);
  });
});
