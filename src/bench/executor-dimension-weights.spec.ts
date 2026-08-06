import { describe, expect, it } from 'vitest';
import type { BenchDimension } from './bench-dimension';
import type { DimensionWeight } from './dimension-weight';
import { EXECUTOR_DIMENSION_WEIGHTS } from './executor-dimension-weights';

describe('EXECUTOR_DIMENSION_WEIGHTS', () => {
  it('weights criteria satisfaction and evidence accuracy', () => {
    expect(
      EXECUTOR_DIMENSION_WEIGHTS.map(
        (weight: DimensionWeight): BenchDimension => weight.dimension,
      ),
    ).toEqual(['criteria-satisfaction', 'evidence-accuracy']);
  });

  it('sums to one so the composite stays in the unit interval', () => {
    const total: number = EXECUTOR_DIMENSION_WEIGHTS.reduce(
      (sum: number, weight: DimensionWeight): number => sum + weight.weight,
      0,
    );
    expect(total).toBeCloseTo(1, 10);
  });

  it('weights what the tree shows above what the artifact claims', () => {
    expect(EXECUTOR_DIMENSION_WEIGHTS[0]?.weight).toBe(0.7);
    expect(EXECUTOR_DIMENSION_WEIGHTS[1]?.weight).toBe(0.3);
  });
});
