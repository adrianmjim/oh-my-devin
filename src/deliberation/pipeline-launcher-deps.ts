import type { PipelineGate } from '../pipeline/pipeline-gate';
import type { StageRunner } from '../pipeline/stage-runner';

export interface PipelineLauncherDeps {
  readonly runStage: StageRunner;
  readonly gate: PipelineGate;
}
