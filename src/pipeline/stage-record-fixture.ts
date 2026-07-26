import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import type { GateDecision } from './gate-decision';
import type { StageRecord } from './stage-record';
import { stageReportFixture } from './stage-report-fixture';

export function stageRecordFixture(
  stage: PipelineStage,
  decision: GateDecision | null,
  overrides: Partial<RunReport> = {},
): StageRecord {
  return { stage, report: stageReportFixture(stage, overrides), decision };
}
