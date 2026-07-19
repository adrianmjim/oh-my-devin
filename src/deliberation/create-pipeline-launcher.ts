import type { PipelineReport } from '../pipeline/pipeline-report';
import { runPipeline } from '../pipeline/run-pipeline';
import type { LaunchRequest } from './pipeline-launcher';
import type { PipelineLauncher } from './pipeline-launcher';
import type { PipelineLauncherDeps } from './pipeline-launcher-deps';

export function createPipelineLauncher(
  deps: PipelineLauncherDeps,
): PipelineLauncher {
  return (request: LaunchRequest): Promise<PipelineReport> =>
    runPipeline({
      team: request.team,
      task: request.question,
      requirements: request.proposal,
      runStage: deps.runStage,
      gate: deps.gate,
    });
}
