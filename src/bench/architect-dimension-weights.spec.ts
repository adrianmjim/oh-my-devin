import { describe, expect, it } from 'vitest';
import { ARCHITECT_DIMENSION_WEIGHTS } from './architect-dimension-weights';
import type { BenchDimension } from './bench-dimension';
import type { DimensionWeight } from './dimension-weight';

describe('ARCHITECT_DIMENSION_WEIGHTS', () => {
  it('weights gap coverage and spurious-step resistance', () => {
    expect(
      ARCHITECT_DIMENSION_WEIGHTS.map(
        (weight: DimensionWeight): BenchDimension => weight.dimension,
      ),
    ).toEqual(['gap-coverage', 'spurious-step-resistance']);
  });

  it('sums to one so the composite stays in the unit interval', () => {
    const total: number = ARCHITECT_DIMENSION_WEIGHTS.reduce(
      (sum: number, weight: DimensionWeight): number => sum + weight.weight,
      0,
    );
    expect(total).toBeCloseTo(1, 10);
  });

  it('weights gap coverage above spurious-step resistance', () => {
    expect(ARCHITECT_DIMENSION_WEIGHTS[0]?.weight).toBe(0.7);
    expect(ARCHITECT_DIMENSION_WEIGHTS[1]?.weight).toBe(0.3);
  });
});
