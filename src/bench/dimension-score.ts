import type { BenchDimension } from './bench-dimension';

export interface DimensionScore {
  readonly dimension: BenchDimension;
  readonly score: number;
}
