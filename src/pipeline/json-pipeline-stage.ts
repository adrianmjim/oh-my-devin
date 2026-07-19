import type { PipelineStage } from '../handoff/pipeline-stage';
import type { FailureTier } from '../outcome/failure-tier';
import type { GateDecision } from './gate-decision';

export interface JsonPipelineStage {
  readonly stage: PipelineStage;
  readonly failureTier: FailureTier | null;
  readonly artifactValid: boolean;
  readonly decision: GateDecision | null;
}
