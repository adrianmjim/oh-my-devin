import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';

export interface StageRequest {
  readonly stage: PipelineStage;
  readonly inputs: ReadonlyMap<HandoffArtifactName, string>;
}
