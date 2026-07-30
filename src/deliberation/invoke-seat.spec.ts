import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import type { CommandRunner } from '../engine/command-runner';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import { DeliberationError } from './deliberation-error';
import { invokeSeat } from './invoke-seat';
import type { SeatInvocation } from './seat-invocation';
import type { SeatSessionDeps } from './seat-session-deps';

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'security',
  lens: 'threat-model',
  proposer: false,
  contrarian: false,
  model: null,
};

const WORKTREE: Worktree = { instanceId: 'seat-security', path: '/wt/seat' };

const INVOCATION: SeatInvocation = {
  seat: SEAT,
  question: 'should we ship?',
  proposal: 'ship it',
  phase: 'position',
  priorArguments: [],
  clarifications: [],
  evidenceSummary: null,
};

const NOOP_WORKTREES: WorktreeProvisioner = {
  create: (instanceId: string): Promise<Worktree> =>
    Promise.resolve({ instanceId, path: `/wt/${instanceId}` }),
  captureDiff: (): Promise<string> => Promise.resolve(''),
  remove: (): Promise<void> => Promise.resolve(),
};

const NOOP_RUNNER: CommandRunner = {
  run: (): Promise<never> => Promise.reject(new Error('unused')),
};

function report(overrides: Partial<RunReport> = {}): RunReport {
  return {
    runId: 'run-seat',
    role: 'security',
    task: 't',
    engine: 'devin-headless',
    sessionId: 's',
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 6,
    wallTimeMs: 0,
    artifactPath: 'position.json',
    writeScope: 'artifact',
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

function deps(
  runSeatRole: (options: RunRoleOptions) => Promise<RunReport>,
  artifact: string,
): SeatSessionDeps {
  return {
    worktrees: NOOP_WORKTREES,
    runRole: runSeatRole,
    runnerFor: (): CommandRunner => NOOP_RUNNER,
    readArtifact: (): Promise<string> => Promise.resolve(artifact),
    clock: (): number => 0,
    userConfigDir: null,
  };
}

const POSITION: string = JSON.stringify({
  kind: 'objection',
  severity: 'high',
  domain: 'threat model',
  concern: 'token leak',
});

describe('invokeSeat', () => {
  it('runs the seat role in its worktree and parses the position', async () => {
    const seen: RunRoleOptions[] = [];

    const position = await invokeSeat(
      deps((options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options);
        return Promise.resolve(report());
      }, POSITION),
      INVOCATION,
      WORKTREE,
    );

    expect(seen[0]?.workingDirectory).toBe('/wt/seat');
    expect(seen[0]?.roleName).toBe('security');
    expect(position.seat).toBe('security');
    expect(position.kind).toBe('objection');
  });

  it('composes the seat prompt as the task', async () => {
    const seen: RunRoleOptions[] = [];

    await invokeSeat(
      deps((options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options);
        return Promise.resolve(report());
      }, POSITION),
      INVOCATION,
      WORKTREE,
    );

    expect(seen[0]?.task).toContain('You hold the "threat-model" lens');
  });

  it('refuses a run that failed', async () => {
    await expect(
      invokeSeat(
        deps(
          (): Promise<RunReport> =>
            Promise.resolve(report({ failureTier: 'deny' })),
          POSITION,
        ),
        INVOCATION,
        WORKTREE,
      ),
    ).rejects.toThrow(DeliberationError);
  });

  it('refuses a run whose artifact did not validate', async () => {
    await expect(
      invokeSeat(
        deps(
          (): Promise<RunReport> =>
            Promise.resolve(report({ artifactValid: false })),
          POSITION,
        ),
        INVOCATION,
        WORKTREE,
      ),
    ).rejects.toThrow(/did not produce a valid position/);
  });
});
