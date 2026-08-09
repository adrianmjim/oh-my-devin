import { describe, expect, it } from 'vitest';
import type { DimensionWeight } from './dimension-weight';
import { DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS } from './document-specialist-dimension-weights';

describe('DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS', () => {
  it('scores source attribution as a dimension of its own', () => {
    expect(
      DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS.map(
        (w: DimensionWeight): string => w.dimension,
      ),
    ).toEqual([
      'detection',
      'source-attribution-accuracy',
      'false-positive-resistance',
    ]);
  });

  it('sums to one', () => {
    const total: number = DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS.reduce(
      (sum: number, w: DimensionWeight): number => sum + w.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });
});
