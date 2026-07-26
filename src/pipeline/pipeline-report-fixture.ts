import type { PipelineStage } from '../handoff/pipeline-stage';
import type { PipelineOutcome } from './pipeline-outcome';
import type { PipelineReport } from './pipeline-report';
import type { StageRecord } from './stage-record';

export function pipelineReportFixture(
  outcome: PipelineOutcome,
  stages: readonly StageRecord[],
  haltedAt: PipelineStage | null = null,
): PipelineReport {
  return {
    runId: 'run-pipeline',
    team: 'feature-team',
    task: 'build the widget',
    outcome,
    stages,
    haltedAt,
  };
}
