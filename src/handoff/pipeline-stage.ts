export type PipelineStage = 'architect' | 'executor' | 'reviewer';

export function isPipelineStage(value: unknown): value is PipelineStage {
  return value === 'architect' || value === 'executor' || value === 'reviewer';
}
