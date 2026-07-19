import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { Worktree } from './worktree';
import { WorktreeError } from './worktree-error';
import { WorktreeManager } from './worktree-manager';

class GitRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];
  public constructor(
    private readonly responder: (
      inv: CommandInvocation,
    ) => CommandResult = () => ({
      stdout: '',
      stderr: '',
      exitCode: 0,
    }),
  ) {}

  public run(inv: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(inv);
    return Promise.resolve(this.responder(inv));
  }
}

interface PendingRun {
  readonly invocation: CommandInvocation;
  readonly resolve: (result: CommandResult) => void;
  readonly reject: (reason: Error) => void;
}

class ManualGitRunner implements CommandRunner {
  public readonly started: CommandInvocation[] = [];
  private readonly pending: PendingRun[] = [];

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.started.push(invocation);
    return new Promise<CommandResult>(
      (
        resolve: (result: CommandResult) => void,
        reject: (reason: Error) => void,
      ): void => {
        this.pending.push({ invocation, resolve, reject });
      },
    );
  }

  public succeedNext(): void {
    const next: PendingRun | undefined = this.pending.shift();
    next?.resolve({ stdout: '', stderr: '', exitCode: 0 });
  }

  public failNext(): void {
    const next: PendingRun | undefined = this.pending.shift();
    next?.reject(new Error('git crashed'));
  }
}

function settleMicrotasks(): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setImmediate(resolve);
  });
}

const BASE = '/repo';

describe('WorktreeManager', () => {
  it('creates a git worktree for a role instance', async () => {
    const runner = new GitRunner();
    const manager = new WorktreeManager(runner, BASE);

    const worktree: Worktree = await manager.create('architect-0');

    expect(worktree.instanceId).toBe('architect-0');
    expect(worktree.path).toBe('/repo/.omd/worktrees/architect-0');
    const add = runner.invocations[0];
    expect(add?.command).toBe('git');
    expect(add?.args).toEqual([
      '-C',
      '/repo',
      'worktree',
      'add',
      '--detach',
      '/repo/.omd/worktrees/architect-0',
    ]);
  });

  it('throws a WorktreeError when worktree creation fails', async () => {
    const runner = new GitRunner(() => ({
      stdout: '',
      stderr: 'fatal: not a git repository',
      exitCode: 128,
    }));
    const manager = new WorktreeManager(runner, BASE);

    await expect(manager.create('x-0')).rejects.toThrow(WorktreeError);
  });

  it('serializes concurrent create calls so their git work never overlaps', async () => {
    const runner = new ManualGitRunner();
    const manager = new WorktreeManager(runner, BASE);

    const first: Promise<Worktree> = manager.create('a-0');
    const second: Promise<Worktree> = manager.create('b-0');
    await settleMicrotasks();

    expect(runner.started).toHaveLength(1);
    expect(runner.started[0]?.args).toContain('/repo/.omd/worktrees/a-0');

    runner.succeedNext();
    await settleMicrotasks();

    expect(runner.started).toHaveLength(2);
    expect(runner.started[1]?.args).toContain('/repo/.omd/worktrees/b-0');

    runner.succeedNext();
    const worktrees: readonly Worktree[] = await Promise.all([first, second]);
    expect(worktrees.map((w: Worktree): string => w.instanceId)).toEqual([
      'a-0',
      'b-0',
    ]);
  });

  it('keeps creating after a failed create and still rejects the failed caller', async () => {
    const runner = new ManualGitRunner();
    const manager = new WorktreeManager(runner, BASE);

    const first: Promise<Worktree> = manager.create('a-0');
    await settleMicrotasks();
    runner.failNext();

    await expect(first).rejects.toThrow('git crashed');

    const second: Promise<Worktree> = manager.create('b-0');
    await settleMicrotasks();

    expect(runner.started).toHaveLength(2);
    runner.succeedNext();

    const worktree: Worktree = await second;
    expect(worktree.instanceId).toBe('b-0');
  });

  it('captures the instance changes as a staged diff', async () => {
    const runner = new GitRunner((inv) =>
      inv.args.includes('diff')
        ? { stdout: 'DIFF-BODY', stderr: '', exitCode: 0 }
        : { stdout: '', stderr: '', exitCode: 0 },
    );
    const manager = new WorktreeManager(runner, BASE);
    const worktree: Worktree = {
      instanceId: 'exec-0',
      path: '/repo/wt/exec-0',
    };

    const diff: string = await manager.captureDiff(worktree);

    expect(diff).toBe('DIFF-BODY');
    expect(runner.invocations[0]?.args).toEqual([
      '-C',
      '/repo/wt/exec-0',
      'add',
      '-A',
    ]);
    expect(runner.invocations[1]?.args).toEqual([
      '-C',
      '/repo/wt/exec-0',
      'diff',
      '--cached',
    ]);
  });

  it('removes the worktree at teardown', async () => {
    const runner = new GitRunner();
    const manager = new WorktreeManager(runner, BASE);
    const worktree: Worktree = { instanceId: 'r-0', path: '/repo/wt/r-0' };

    await manager.remove(worktree);

    expect(runner.invocations[0]?.args).toEqual([
      '-C',
      '/repo',
      'worktree',
      'remove',
      '--force',
      '/repo/wt/r-0',
    ]);
  });
});
