import type { DimensionWeight } from './dimension-weight';

export const CRITIC_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'detection', weight: 0.3 },
  { dimension: 'missing-element-coverage', weight: 0.3 },
  { dimension: 'false-positive-resistance', weight: 0.25 },
  { dimension: 'verdict-accuracy', weight: 0.15 },
];
