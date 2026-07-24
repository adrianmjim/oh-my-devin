import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunId } from '../observability/run-id';
import type { JsonPipelineStage } from './json-pipeline-stage';
import type { PipelineOutcome } from './pipeline-outcome';

export interface JsonPipelineReport {
  readonly runId: RunId;
  readonly team: string;
  readonly task: string;
  readonly outcome: PipelineOutcome;
  readonly exitCode: number;
  readonly haltedAt: PipelineStage | null;
  readonly stages: readonly JsonPipelineStage[];
}
