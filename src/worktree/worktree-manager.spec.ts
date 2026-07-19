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
