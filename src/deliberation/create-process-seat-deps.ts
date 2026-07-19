import { readFile } from 'node:fs/promises';
import type { CommandRunner } from '../engine/command-runner';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { runRole } from '../run/run-role';
import { WorktreeManager } from '../worktree/worktree-manager';
import type { SeatSessionDeps } from './seat-session-deps';

export function createProcessSeatDeps(baseDir: string): SeatSessionDeps {
  return {
    worktrees: new WorktreeManager(new ProcessCommandRunner(baseDir), baseDir),
    runRole,
    runnerFor: (workingDirectory: string): CommandRunner =>
      new ProcessCommandRunner(workingDirectory),
    readArtifact: (absolutePath: string): Promise<string> =>
      readFile(absolutePath, 'utf8'),
    clock: (): number => Date.now(),
  };
}
