import type { PipelineStage } from './pipeline-stage';
import type { StageEntry } from './stage-entry';

export function reworkStageEntry(
  stage: PipelineStage,
  reworkFrom: PipelineStage,
): StageEntry {
  return { stage, reworkFrom };
}
