import type { DimensionWeight } from './dimension-weight';

export const DEBUGGER_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'root-cause-localization', weight: 0.5 },
  { dimension: 'detection', weight: 0.3 },
  { dimension: 'false-positive-resistance', weight: 0.2 },
];
