import { describe, expect, it } from 'vitest';
import type { DimensionWeight } from './dimension-weight';
import { EXPLORE_DIMENSION_WEIGHTS } from './explore-dimension-weights';

describe('EXPLORE_DIMENSION_WEIGHTS', () => {
  it('scores relationship coverage alongside file recall', () => {
    expect(
      EXPLORE_DIMENSION_WEIGHTS.map((w: DimensionWeight): string => w.dimension),
    ).toEqual([
      'file-recall',
      'relationship-coverage',
      'false-positive-resistance',
    ]);
  });

  it('sums to one', () => {
    const total: number = EXPLORE_DIMENSION_WEIGHTS.reduce(
      (sum: number, w: DimensionWeight): number => sum + w.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });
});
