import type { PipelineStage } from '../handoff/pipeline-stage';
import type { PipelineOutcome } from './pipeline-outcome';
import type { StageRecord } from './stage-record';

export interface PipelineReport {
  readonly team: string;
  readonly task: string;
  readonly outcome: PipelineOutcome;
  readonly stages: readonly StageRecord[];
  readonly haltedAt: PipelineStage | null;
}
