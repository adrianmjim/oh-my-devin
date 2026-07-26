import type { HandoffArtifactName } from './handoff-artifact-name';
import type { PipelineStage } from './pipeline-stage';

export const INCOMING_ARTIFACTS: Record<
  PipelineStage,
  readonly HandoffArtifactName[]
> = {
  architect: ['requirements'],
  executor: ['requirements', 'architecture.json'],
  reviewer: ['requirements', 'diff', 'evidence.json'],
};
