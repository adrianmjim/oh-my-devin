import { describe, expect, it } from 'vitest';
import type { DimensionWeight } from './dimension-weight';
import { SECURITY_REVIEWER_DIMENSION_WEIGHTS } from './security-reviewer-dimension-weights';

describe('SECURITY_REVIEWER_DIMENSION_WEIGHTS', () => {
  it('carries a severity-accuracy dimension of its own', () => {
    expect(
      SECURITY_REVIEWER_DIMENSION_WEIGHTS.map(
        (w: DimensionWeight): string => w.dimension,
      ),
    ).toEqual([
      'detection',
      'false-positive-resistance',
      'severity-accuracy',
      'verdict-accuracy',
    ]);
  });

  it('sums to one', () => {
    const total: number = SECURITY_REVIEWER_DIMENSION_WEIGHTS.reduce(
      (sum: number, w: DimensionWeight): number => sum + w.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });
});
