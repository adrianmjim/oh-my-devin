import { describe, expect, it } from 'vitest';
import { ANALYST_DIMENSION_WEIGHTS } from './analyst-dimension-weights';
import type { DimensionWeight } from './dimension-weight';

describe('ANALYST_DIMENSION_WEIGHTS', () => {
  it('covers detection, gap coverage, and false positives', () => {
    expect(
      ANALYST_DIMENSION_WEIGHTS.map((w: DimensionWeight): string => w.dimension),
    ).toEqual(['detection', 'gap-coverage', 'false-positive-resistance']);
  });

  it('sums to one', () => {
    const total: number = ANALYST_DIMENSION_WEIGHTS.reduce(
      (sum: number, w: DimensionWeight): number => sum + w.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });
});
