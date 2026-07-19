import { readFile } from 'node:fs/promises';
import type { CommandRunner } from '../engine/command-runner';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { runRole } from '../run/run-role';
import { WorktreeManager } from '../worktree/worktree-manager';
import { createStageRunner } from './create-stage-runner';
import type { StageRunner } from './stage-runner';

export function createProcessStageRunner(baseDir: string): StageRunner {
  const worktrees: WorktreeManager = new WorktreeManager(
    new ProcessCommandRunner(baseDir),
    baseDir,
  );
  return createStageRunner({
    worktrees,
    runRole,
    runnerFor: (workingDirectory: string): CommandRunner =>
      new ProcessCommandRunner(workingDirectory),
    readArtifact: (absolutePath: string): Promise<string> =>
      readFile(absolutePath, 'utf8'),
    clock: (): number => Date.now(),
  });
}
