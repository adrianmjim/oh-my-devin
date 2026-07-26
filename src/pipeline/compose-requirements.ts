import type { RunPipelineOptions } from './run-pipeline-options';

export function composeRequirements(options: RunPipelineOptions): string {
  if (options.requirements === undefined) {
    return options.task;
  }
  return `${options.task}\n\n${options.requirements}`;
}
