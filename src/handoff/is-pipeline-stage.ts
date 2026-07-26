import type { PipelineStage } from './pipeline-stage';

export function isPipelineStage(value: unknown): value is PipelineStage {
  return value === 'architect' || value === 'executor' || value === 'reviewer';
}
