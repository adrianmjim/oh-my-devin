import { join } from 'node:path';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { Worktree } from './worktree';
import { WorktreeError } from './worktree-error';
import type { WorktreeProvisioner } from './worktree-provisioner';

export class WorktreeManager implements WorktreeProvisioner {
  private readonly runner: CommandRunner;
  private readonly baseDir: string;
  private creationTail: Promise<void>;

  public constructor(runner: CommandRunner, baseDir: string) {
    this.runner = runner;
    this.baseDir = baseDir;
    this.creationTail = Promise.resolve();
  }

  public worktreePath(instanceId: string): string {
    return join(this.baseDir, '.omd', 'worktrees', instanceId);
  }

  public create(instanceId: string): Promise<Worktree> {
    const creation: Promise<Worktree> = this.creationTail.then(
      (): Promise<Worktree> => this.addWorktree(instanceId),
    );
    this.creationTail = creation.then(
      (): void => undefined,
      (): void => undefined,
    );
    return creation;
  }

  private async addWorktree(instanceId: string): Promise<Worktree> {
    const path: string = this.worktreePath(instanceId);
    const result: CommandResult = await this.runner.run({
      command: 'git',
      args: ['-C', this.baseDir, 'worktree', 'add', '--detach', path],
    });
    if (result.exitCode !== 0) {
      throw new WorktreeError(
        `git worktree add failed for "${instanceId}": ${result.stderr.trim()}`,
      );
    }
    return { instanceId, path };
  }

  public async captureDiff(worktree: Worktree): Promise<string> {
    await this.runner.run({
      command: 'git',
      args: ['-C', worktree.path, 'add', '-A'],
    });
    const result: CommandResult = await this.runner.run({
      command: 'git',
      args: ['-C', worktree.path, 'diff', '--cached'],
    });
    return result.stdout;
  }

  public async remove(worktree: Worktree): Promise<void> {
    await this.runner.run({
      command: 'git',
      args: [
        '-C',
        this.baseDir,
        'worktree',
        'remove',
        '--force',
        worktree.path,
      ],
    });
  }
}
