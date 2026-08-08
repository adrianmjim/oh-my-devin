import { describe, expect, it } from 'vitest';
import type { BenchDimension } from './bench-dimension';
import type { DimensionWeight } from './dimension-weight';
import { REVIEWER_DIMENSION_WEIGHTS } from './reviewer-dimension-weights';

describe('REVIEWER_DIMENSION_WEIGHTS', () => {
  it('weights detection, false positives, severity and verdict accuracy', () => {
    expect(
      REVIEWER_DIMENSION_WEIGHTS.map(
        (weight: DimensionWeight): BenchDimension => weight.dimension,
      ),
    ).toEqual([
      'detection',
      'false-positive-resistance',
      'severity-accuracy',
      'verdict-accuracy',
    ]);
  });

  it('sums to one so the composite stays in the unit interval', () => {
    const total: number = REVIEWER_DIMENSION_WEIGHTS.reduce(
      (sum: number, weight: DimensionWeight): number => sum + weight.weight,
      0,
    );
    expect(total).toBeCloseTo(1, 10);
  });

  it('weights detection above every other dimension', () => {
    const detection: DimensionWeight | undefined =
      REVIEWER_DIMENSION_WEIGHTS.find(
        (weight: DimensionWeight): boolean => weight.dimension === 'detection',
      );
    const others: readonly number[] = REVIEWER_DIMENSION_WEIGHTS.filter(
      (weight: DimensionWeight): boolean => weight.dimension !== 'detection',
    ).map((weight: DimensionWeight): number => weight.weight);
    expect(detection?.weight).toBe(0.4);
    for (const weight of others) {
      expect(weight).toBeLessThan(0.4);
    }
  });
});
