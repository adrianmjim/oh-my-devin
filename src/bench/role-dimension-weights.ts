import { ARCHITECT_DIMENSION_WEIGHTS } from './architect-dimension-weights';
import type { BenchRole } from './bench-role';
import type { DimensionWeight } from './dimension-weight';
import { EXECUTOR_DIMENSION_WEIGHTS } from './executor-dimension-weights';
import { REVIEWER_DIMENSION_WEIGHTS } from './reviewer-dimension-weights';

export function roleDimensionWeights(
  role: BenchRole,
): readonly DimensionWeight[] {
  let weights: readonly DimensionWeight[];
  if (role === 'reviewer') {
    weights = REVIEWER_DIMENSION_WEIGHTS;
  } else if (role === 'architect') {
    weights = ARCHITECT_DIMENSION_WEIGHTS;
  } else {
    weights = EXECUTOR_DIMENSION_WEIGHTS;
  }
  return weights;
}
