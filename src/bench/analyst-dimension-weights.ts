import type { DimensionWeight } from './dimension-weight';

export const ANALYST_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'detection', weight: 0.4 },
  { dimension: 'gap-coverage', weight: 0.3 },
  { dimension: 'false-positive-resistance', weight: 0.3 },
];
