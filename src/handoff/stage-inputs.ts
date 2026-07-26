import type { HandoffArtifactName } from './handoff-artifact-name';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
import type { PipelineStage } from './pipeline-stage';

export function stageInputs(
  stage: PipelineStage,
): readonly HandoffArtifactName[] {
  return INCOMING_ARTIFACTS[stage];
}
