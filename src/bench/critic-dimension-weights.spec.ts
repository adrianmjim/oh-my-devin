import { describe, expect, it } from 'vitest';
import { CRITIC_DIMENSION_WEIGHTS } from './critic-dimension-weights';
import type { DimensionWeight } from './dimension-weight';

describe('CRITIC_DIMENSION_WEIGHTS', () => {
  it('scores missing-element coverage apart from present-flaw detection', () => {
    const dimensions: readonly string[] = CRITIC_DIMENSION_WEIGHTS.map(
      (weight: DimensionWeight): string => weight.dimension,
    );

    expect(dimensions).toContain('detection');
    expect(dimensions).toContain('missing-element-coverage');
  });

  it('covers false positives and verdict accuracy too', () => {
    const dimensions: readonly string[] = CRITIC_DIMENSION_WEIGHTS.map(
      (weight: DimensionWeight): string => weight.dimension,
    );

    expect(dimensions).toContain('false-positive-resistance');
    expect(dimensions).toContain('verdict-accuracy');
  });

  it('weights the two halves of the critique equally', () => {
    const of = (dimension: string): number =>
      CRITIC_DIMENSION_WEIGHTS.find(
        (weight: DimensionWeight): boolean => weight.dimension === dimension,
      )?.weight ?? 0;

    expect(of('missing-element-coverage')).toBe(of('detection'));
  });

  it('sums to one and names each dimension once', () => {
    const total: number = CRITIC_DIMENSION_WEIGHTS.reduce(
      (sum: number, weight: DimensionWeight): number => sum + weight.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
    expect(new Set(CRITIC_DIMENSION_WEIGHTS.map((w) => w.dimension)).size).toBe(
      CRITIC_DIMENSION_WEIGHTS.length,
    );
  });
});
