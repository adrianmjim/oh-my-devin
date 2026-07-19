import type { PipelineReport } from '../pipeline/pipeline-report';

export interface BridgeResult {
  readonly launched: boolean;
  readonly pipeline: PipelineReport | null;
}
