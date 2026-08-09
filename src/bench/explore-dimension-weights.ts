import type { DimensionWeight } from './dimension-weight';

export const EXPLORE_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'file-recall', weight: 0.45 },
  { dimension: 'relationship-coverage', weight: 0.3 },
  { dimension: 'false-positive-resistance', weight: 0.25 },
];
