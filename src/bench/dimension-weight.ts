import type { BenchDimension } from './bench-dimension';

export interface DimensionWeight {
  readonly dimension: BenchDimension;
  readonly weight: number;
}
