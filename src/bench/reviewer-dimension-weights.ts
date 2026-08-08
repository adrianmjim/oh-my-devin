import type { DimensionWeight } from './dimension-weight';

export const REVIEWER_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'detection', weight: 0.4 },
  { dimension: 'false-positive-resistance', weight: 0.3 },
  { dimension: 'severity-accuracy', weight: 0.15 },
  { dimension: 'verdict-accuracy', weight: 0.15 },
];
