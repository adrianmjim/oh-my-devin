import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import type { GateDecision } from './gate-decision';

export interface StageRecord {
  readonly stage: PipelineStage;
  readonly report: RunReport;
  readonly decision: GateDecision | null;
}
