import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunId } from '../observability/run-id';
import type { PipelineReport } from './pipeline-report';
import type { RunPipelineOptions } from './run-pipeline-options';
import type { StageRecord } from './stage-record';

export function terminatePipeline(
  options: RunPipelineOptions,
  runId: RunId,
  records: readonly StageRecord[],
  outcome: PipelineReport['outcome'],
  haltedAt: PipelineStage | null,
): PipelineReport {
  return {
    runId,
    team: options.team.name,
    task: options.task,
    outcome,
    stages: records,
    haltedAt,
  };
}
