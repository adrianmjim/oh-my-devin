import type { DimensionWeight } from './dimension-weight';

export const SECURITY_REVIEWER_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'detection', weight: 0.4 },
  { dimension: 'false-positive-resistance', weight: 0.25 },
  { dimension: 'severity-accuracy', weight: 0.2 },
  { dimension: 'verdict-accuracy', weight: 0.15 },
];
