import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';

export const ROLE_ARTIFACT: Record<PipelineStage, HandoffArtifactName> = {
  architect: 'architecture.json',
  executor: 'evidence.json',
  reviewer: 'review.json',
};
