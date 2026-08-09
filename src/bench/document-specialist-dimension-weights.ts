import type { DimensionWeight } from './dimension-weight';

export const DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS: readonly DimensionWeight[] =
  [
    { dimension: 'detection', weight: 0.4 },
    { dimension: 'source-attribution-accuracy', weight: 0.35 },
    { dimension: 'false-positive-resistance', weight: 0.25 },
  ];
