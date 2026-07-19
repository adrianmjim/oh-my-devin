import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';

export interface GatePresentation {
  readonly stage: PipelineStage;
  readonly report: RunReport;
}
