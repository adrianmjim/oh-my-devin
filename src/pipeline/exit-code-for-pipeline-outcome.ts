import type { PipelineOutcome } from './pipeline-outcome';

export function exitCodeForPipelineOutcome(outcome: PipelineOutcome): number {
  return outcome === 'succeeded' ? 0 : 1;
}
