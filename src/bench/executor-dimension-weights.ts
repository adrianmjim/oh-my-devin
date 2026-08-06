import type { DimensionWeight } from './dimension-weight';

export const EXECUTOR_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'criteria-satisfaction', weight: 0.3 },
  { dimension: 'verification-outcome', weight: 0.3 },
  { dimension: 'test-integrity', weight: 0.2 },
  { dimension: 'evidence-accuracy', weight: 0.2 },
];
