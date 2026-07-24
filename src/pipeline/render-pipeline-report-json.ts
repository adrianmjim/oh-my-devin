import { exitCodeForPipelineOutcome } from './exit-code-for-pipeline-outcome';
import type { JsonPipelineReport } from './json-pipeline-report';
import type { JsonPipelineStage } from './json-pipeline-stage';
import type { PipelineReport } from './pipeline-report';
import type { StageRecord } from './stage-record';

export function renderPipelineReportJson(
  report: PipelineReport,
): JsonPipelineReport {
  return {
    runId: report.runId,
    team: report.team,
    task: report.task,
    outcome: report.outcome,
    exitCode: exitCodeForPipelineOutcome(report.outcome),
    haltedAt: report.haltedAt,
    stages: report.stages.map((record: StageRecord): JsonPipelineStage => ({
      stage: record.stage,
      failureTier: record.report.failureTier,
      artifactValid: record.report.artifactValid,
      decision: record.decision,
    })),
  };
}
