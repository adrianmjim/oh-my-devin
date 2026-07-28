import { join } from 'node:path';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import { composeStagePrompt } from './compose-stage-prompt';
import { ROLE_ARTIFACT } from './role-artifact';
import type { StageRequest } from './stage-request';
import type { StageResult } from './stage-result';
import type { StageRunner } from './stage-runner';
import type { StageRunnerDeps } from './stage-runner-deps';

export function createStageRunner(deps: StageRunnerDeps): StageRunner {
  return async (request: StageRequest): Promise<StageResult> => {
    const worktree: Worktree = await deps.worktrees.create(request.stage);
    try {
      const lookup: LayerLookup = {
        projectDir: worktree.path,
        userConfigDir: deps.userConfigDir,
      };
      const report: RunReport = await deps.runRole({
        roleName: request.stage,
        task: composeStagePrompt(request),
        workingDirectory: worktree.path,
        model: null,
        runner: deps.runnerFor(worktree.path),
        clock: deps.clock,
        lookup,
        provisionedWorktree: true,
      });

      if (report.failureTier !== null || !report.artifactValid) {
        return {
          report,
          produced: new Map<HandoffArtifactName, string>(),
        };
      }

      const produced: Map<HandoffArtifactName, string> = new Map<
        HandoffArtifactName,
        string
      >();
      produced.set(
        ROLE_ARTIFACT[request.stage],
        await deps.readArtifact(join(worktree.path, report.artifactPath)),
      );
      if (report.writeScope === 'worktree') {
        produced.set(
          'diff',
          await deps.worktrees.captureDiff(worktree, report.artifactPath),
        );
      }
      return { report, produced };
    } finally {
      await deps.worktrees.remove(worktree);
    }
  };
}
