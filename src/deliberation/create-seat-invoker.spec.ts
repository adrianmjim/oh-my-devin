import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { RunReport } from '../outcome/run-report';
import { ParallelError } from '../parallel/parallel-error';
import { runRole } from '../run/run-role';
import type { RunRoleOptions } from '../run/run-role-options';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { createSeatInvoker } from './create-seat-invoker';
import type { SeatInvocation } from './seat-invocation';
import type { SeatInvoker } from './seat-invoker';
import type { SeatPosition } from './seat-position';
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

class DeferredWorktrees implements WorktreeProvisioner {
  public readonly requested: string[] = [];
  private readonly pending: Map<string, (worktree: Worktree) => void> = new Map<
    string,
    (worktree: Worktree) => void
  >();

  public create(instanceId: string): Promise<Worktree> {
    this.requested.push(instanceId);
    return new Promise<Worktree>(
      (resolve: (worktree: Worktree) => void): void => {
        this.pending.set(instanceId, resolve);
      },
    );
  }

  public release(instanceId: string): void {
    const resolve: ((worktree: Worktree) => void) | undefined =
      this.pending.get(instanceId);
    if (resolve !== undefined) {
      resolve({ instanceId, path: `/wt/${instanceId}` });
    }
  }

  public captureDiff(): Promise<string> {
    return Promise.resolve('');
  }

  public remove(): Promise<void> {
    return Promise.resolve();
  }
}

function settleMicrotasks(): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setImmediate(resolve);
  });
}

class Barrier {
  private arrived: number = 0;
  private readonly size: number;
  private readonly waiting: (() => void)[] = [];

  public constructor(size: number) {
    this.size = size;
  }

  public arrive(): Promise<void> {
    this.arrived += 1;
    if (this.arrived >= this.size) {
      for (const release of this.waiting) {
        release();
      }
      this.waiting.length = 0;
      return Promise.resolve();
    }
    return new Promise<void>((resolve: () => void): void => {
      this.waiting.push(resolve);
    });
  }
}

const NOOP_RUNNER: CommandRunner = {
  run: (): Promise<never> => Promise.reject(new Error('unused')),
};

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'security',
  lens: 'threat-model',
  proposer: false,
  contrarian: false,
  model: null,
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
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

function makeDeps(
  runSeatRole: (options: RunRoleOptions) => Promise<RunReport>,
  worktrees: WorktreeProvisioner,
  read: (path: string) => Promise<string>,
): SeatSessionDeps {
  return {
    worktrees,
    runRole: runSeatRole,
    runnerFor: (): CommandRunner => NOOP_RUNNER,
    readArtifact: read,
    clock: (): number => 0,
  };
}

function invocation(overrides: Partial<SeatInvocation> = {}): SeatInvocation {
  return {
    seat: SEAT,
    question: 'should we ship?',
    proposal: 'ship the plan',
    phase: 'position',
    priorArguments: [],
    clarifications: [],
    evidenceSummary: null,
    ...overrides,
  };
}

const POSITION_JSON: string = JSON.stringify({
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'token leak',
});

describe('createSeatInvoker', () => {
  it('runs the seat role in a pooled worktree and maps its position artifact', async () => {
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
      new WorktreePool(worktrees),
    );

    const positions: readonly SeatPosition[] = await invoke([
      invocation({
        priorArguments: [
          {
            kind: 'preference',
            domain: 'ux',
            severity: 'low',
            concern: 'copy',
          },
        ],
      }),
    ]);

    expect(worktrees.created).toEqual(['seat-security']);
    expect(seen[0]?.roleName).toBe('security');
    expect(seen[0]?.workingDirectory).toBe('/wt/seat-security');
    expect(seen[0]?.task).toContain('threat-model');
    expect(seen[0]?.task).toContain('should we ship?');
    expect(seen[0]?.task).toContain('ship the plan');
    expect(seen[0]?.task).toContain('copy');
    expect(positions[0]?.seat).toBe('security');
    expect(positions[0]?.lens).toBe('threat-model');
    expect(positions[0]?.kind).toBe('objection');
  });

  it('forwards a declared seat model and falls back to the role model when null', async () => {
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
      new WorktreePool(worktrees),
    );

    await invoke([
      invocation({ seat: { ...SEAT, model: 'seat-tier' } }),
      invocation({
        seat: { ...SEAT, id: 'sre', role: 'sre', lens: 'operability' },
      }),
    ]);

    expect(
      seen.map((options: RunRoleOptions): string | null => options.model),
    ).toEqual(['seat-tier', null]);
  });

  it('keeps the seat worktree alive so later rounds reuse the same session directory', async () => {
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
      new WorktreePool(worktrees),
    );

    await invoke([invocation({})]);
    await invoke([invocation({})]);

    expect(worktrees.created).toEqual(['seat-security']);
    expect(worktrees.removed).toEqual([]);
    expect(
      seen.map((options: RunRoleOptions): string => options.workingDirectory),
    ).toEqual(['/wt/seat-security', '/wt/seat-security']);
  });

  it('resumes the seat session on the second round of the deliberation', async () => {
    const base: string = await mkdtemp(join(tmpdir(), 'omd-seat-'));
    const registry: Map<string, string> = new Map<string, string>();
    const recorded: CommandInvocation[] = [];

    class SeatEngineStub implements CommandRunner {
      public constructor(private readonly directory: string) {}

      public async run(inv: CommandInvocation): Promise<CommandResult> {
        recorded.push(inv);
        if (inv.args.includes('list')) {
          const sessions = [...registry.entries()].map(([dir, id]) => ({
            id,
            working_directory: dir,
          }));
          return { stdout: JSON.stringify(sessions), stderr: '', exitCode: 0 };
        }
        if (!registry.has(this.directory)) {
          registry.set(this.directory, `seat-session-${registry.size + 1}`);
        }
        await writeFile(
          join(this.directory, 'position.json'),
          POSITION_JSON,
          'utf8',
        );
        return { stdout: '', stderr: '', exitCode: 0 };
      }
    }

    class TempWorktrees implements WorktreeProvisioner {
      public async create(instanceId: string): Promise<Worktree> {
        const path: string = join(base, instanceId);
        const roleDir: string = join(path, '.devin', 'agents', 'security');
        await mkdir(roleDir, { recursive: true });
        await writeFile(
          join(roleDir, 'AGENT.md'),
          [
            '---',
            'omd-output: position.json',
            'omd-schema: position.schema.json',
            'omd-max-turns: 4',
            '---',
            'You are the security seat.',
          ].join('\n'),
          'utf8',
        );
        await writeFile(
          join(path, 'position.schema.json'),
          JSON.stringify({ type: 'object' }),
          'utf8',
        );
        return { instanceId, path };
      }

      public captureDiff(): Promise<string> {
        return Promise.resolve('');
      }

      public remove(): Promise<void> {
        return Promise.resolve();
      }
    }

    const worktrees = new TempWorktrees();
    const invoke: SeatInvoker = createSeatInvoker(
      {
        worktrees,
        runRole,
        runnerFor: (workingDirectory: string): CommandRunner =>
          new SeatEngineStub(workingDirectory),
        readArtifact: (): Promise<string> => Promise.resolve(POSITION_JSON),
        clock: (): number => 0,
      },
      new WorktreePool(worktrees),
    );

    try {
      await invoke([invocation({})]);
      await invoke([invocation({})]);

      const turns = recorded.filter((i) => i.args.includes('-p'));
      expect(turns).toHaveLength(2);
      expect(turns[0]?.args).not.toContain('--resume');
      expect(turns[1]?.args.slice(0, 2)).toEqual([
        '--resume',
        'seat-session-1',
      ]);
    } finally {
      await rm(base, { recursive: true, force: true });
    }
  });

  it('collects the seats of a batch concurrently in distinct worktrees', async () => {
    const worktrees = new FakeWorktrees();
    const barrier = new Barrier(2);
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        async (): Promise<RunReport> => {
          await barrier.arrive();
          return report();
        },
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
      new WorktreePool(worktrees),
    );

    const positions: readonly SeatPosition[] = await invoke([
      invocation({}),
      invocation({
        seat: { ...SEAT, id: 'sre', role: 'sre', lens: 'operability' },
      }),
    ]);

    expect(positions.map((p: SeatPosition): string => p.seat)).toEqual([
      'security',
      'sre',
    ]);
    expect(worktrees.created.sort()).toEqual(['seat-security', 'seat-sre']);
  });

  it('runs two seats holding the same role in distinct worktrees', async () => {
    const worktrees = new FakeWorktrees();
    const barrier = new Barrier(2);
    const seen: RunRoleOptions[] = [];
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        async (options: RunRoleOptions): Promise<RunReport> => {
          seen.push(options);
          await barrier.arrive();
          return report();
        },
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
      new WorktreePool(worktrees),
    );

    const positions: readonly SeatPosition[] = await invoke([
      invocation({ seat: { ...SEAT, id: 'security-1' } }),
      invocation({
        seat: { ...SEAT, id: 'security-2', lens: 'compliance' },
      }),
    ]);

    expect(worktrees.created.sort()).toEqual([
      'seat-security-1',
      'seat-security-2',
    ]);
    expect(positions.map((p: SeatPosition): string => p.seat)).toEqual([
      'security-1',
      'security-2',
    ]);
    expect(
      seen.map((options: RunRoleOptions): string => options.roleName),
    ).toEqual(['security', 'security']);
  });

  it('initiates every worktree acquisition before any completes and keeps the pairing', async () => {
    const worktrees = new DeferredWorktrees();
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
      new WorktreePool(worktrees),
    );

    const invoking: Promise<readonly SeatPosition[]> = invoke([
      invocation({}),
      invocation({
        seat: { ...SEAT, id: 'sre', role: 'sre', lens: 'operability' },
      }),
    ]);
    await settleMicrotasks();

    expect(worktrees.requested).toEqual(['seat-security', 'seat-sre']);

    worktrees.release('seat-sre');
    await settleMicrotasks();
    worktrees.release('seat-security');
    const positions: readonly SeatPosition[] = await invoking;

    expect(positions.map((p: SeatPosition): string => p.seat)).toEqual([
      'security',
      'sre',
    ]);
    const directories: Map<string, string> = new Map<string, string>(
      seen.map((options: RunRoleOptions): [string, string] => [
        options.roleName,
        options.workingDirectory,
      ]),
    );
    expect(directories.get('security')).toBe('/wt/seat-security');
    expect(directories.get('sre')).toBe('/wt/seat-sre');
  });

  it('rejects a batch that would run two invocations in one worktree', async () => {
    const worktrees = new FakeWorktrees();
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        (): Promise<RunReport> => Promise.resolve(report()),
        worktrees,
        (): Promise<string> => Promise.resolve(POSITION_JSON),
      ),
      new WorktreePool(worktrees),
    );

    await expect(invoke([invocation({}), invocation({})])).rejects.toThrow(
      ParallelError,
    );
  });

  it('asks for clarification questions in the clarification phase', async () => {
    const worktrees = new FakeWorktrees();
    let task: string = '';
    const invoke: SeatInvoker = createSeatInvoker(
      makeDeps(
        (options: RunRoleOptions): Promise<RunReport> => {
          task = options.task;
          return Promise.resolve(report());
        },
        worktrees,
        (): Promise<string> =>
          Promise.resolve(
            JSON.stringify({ kind: 'clarification', questions: [] }),
          ),
      ),
      new WorktreePool(worktrees),
    );

    const positions: readonly SeatPosition[] = await invoke([
      invocation({ phase: 'clarification' }),
    ]);

    expect(task).toContain('"clarification"');
    expect(task).toContain('should we ship?');
    expect(task).toContain('ship the plan');
    expect(positions[0]?.kind).toBe('clarification');
  });

  it('relays anonymized clarification answers into the position prompt', async () => {
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
      new WorktreePool(worktrees),
    );

    await invoke([
      invocation({
        clarifications: [
          { question: 'what is the rollout plan?', answer: 'canary first' },
          { question: 'who owns rollback?', answer: null },
        ],
        evidenceSummary: 'seats broadly favor shipping',
      }),
    ]);

    expect(task).toContain('what is the rollout plan?');
    expect(task).toContain('canary first');
    expect(task).toContain('who owns rollback?');
    expect(task).toContain('seats broadly favor shipping');
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
      new WorktreePool(worktrees),
    );

    await invoke([invocation({ seat: { ...SEAT, contrarian: true } })]);

    expect(task.toLowerCase()).toContain('contrarian');
  });

  it('throws when a seat session fails to produce a valid position', async () => {
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
      new WorktreePool(worktrees),
    );

    await expect(invoke([invocation({})])).rejects.toThrow(DeliberationError);
  });
});
