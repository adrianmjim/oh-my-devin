import { readFile } from 'node:fs/promises';
import type { CommandRunner } from '../engine/command-runner';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RunClaim } from '../observability/run-claim';
import type { RunId } from '../observability/run-id';
import { writeRunClaim } from '../observability/write-run-claim';
import { runRole } from '../run/run-role';
import { WorktreeManager } from '../worktree/worktree-manager';
import { createStageRunner } from './create-stage-runner';
import type { StageRunner } from './stage-runner';

export function createProcessStageRunner(
  baseDir: string,
  userConfigDir: LayerLookup['userConfigDir'],
  runId: RunId,
): StageRunner {
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
    userConfigDir,
    memoryBaseDir: baseDir,
    claimRun: (claim: RunClaim): Promise<void> =>
      writeRunClaim(baseDir, runId, claim),
  });
}
