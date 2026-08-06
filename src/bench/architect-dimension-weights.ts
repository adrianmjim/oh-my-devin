import type { DimensionWeight } from './dimension-weight';

export const ARCHITECT_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'gap-coverage', weight: 0.7 },
  { dimension: 'spurious-step-resistance', weight: 0.3 },
];
