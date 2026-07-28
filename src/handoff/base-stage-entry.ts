import type { PipelineStage } from './pipeline-stage';
import type { StageEntry } from './stage-entry';

export function baseStageEntry(stage: PipelineStage): StageEntry {
  return { stage, reworkFrom: null };
}
