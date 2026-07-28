import type { PipelineStage } from './pipeline-stage';

export interface StageEntry {
  readonly stage: PipelineStage;
  readonly reworkFrom: PipelineStage | null;
}
