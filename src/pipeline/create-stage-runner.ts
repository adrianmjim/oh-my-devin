import { join } from 'node:path';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import type { StageRequest } from './stage-request';
import type { StageResult } from './stage-result';
import type { StageRunner } from './stage-runner';
import type { StageRunnerDeps } from './stage-runner-deps';

const ROLE_ARTIFACT: Record<PipelineStage, HandoffArtifactName> = {
  architect: 'architecture.json',
  executor: 'evidence.json',
  reviewer: 'review.json',
};

export function createStageRunner(deps: StageRunnerDeps): StageRunner {
  return async (request: StageRequest): Promise<StageResult> => {
    const worktree: Worktree = await deps.worktrees.create(request.stage);
    try {
      const report: RunReport = await deps.runRole({
        roleName: request.stage,
        task: composePrompt(request),
        workingDirectory: worktree.path,
        runner: deps.runnerFor(worktree.path),
        clock: deps.clock,
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
      if (request.stage === 'executor') {
        produced.set('diff', await deps.worktrees.captureDiff(worktree));
      }
      return { report, produced };
    } finally {
      await deps.worktrees.remove(worktree);
    }
  };
}

function composePrompt(request: StageRequest): string {
  const sections: string[] = [];
  const requirements: string | undefined = request.inputs.get('requirements');
  if (requirements !== undefined) {
    sections.push(requirements);
  }
  for (const [name, content] of request.inputs) {
    if (name === 'requirements') {
      continue;
    }
    sections.push(`## ${name}\n${content}`);
  }
  return sections.join('\n\n');
}
