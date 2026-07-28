import type { HandoffArtifactName } from './handoff-artifact-name';
import type { PipelineStage } from './pipeline-stage';

export interface ReworkDesignation {
  readonly rejectedBy: PipelineStage;
  readonly reentered: PipelineStage;
  readonly artifacts: readonly HandoffArtifactName[];
}
