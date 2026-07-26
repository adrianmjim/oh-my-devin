import type { RunPipelineOptions } from './run-pipeline-options';

export function pipelineNow(options: RunPipelineOptions): number {
  return options.clock?.() ?? 0;
}
