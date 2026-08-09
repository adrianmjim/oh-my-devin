import { describe, expect, it } from 'vitest';
import { DEBUGGER_DIMENSION_WEIGHTS } from './debugger-dimension-weights';
import type { DimensionWeight } from './dimension-weight';

describe('DEBUGGER_DIMENSION_WEIGHTS', () => {
  it('scores localization against the planted cause', () => {
    expect(
      DEBUGGER_DIMENSION_WEIGHTS.map(
        (w: DimensionWeight): string => w.dimension,
      ),
    ).toEqual([
      'root-cause-localization',
      'detection',
      'false-positive-resistance',
    ]);
  });

  it('weights localization above the rest', () => {
    const localization: number =
      DEBUGGER_DIMENSION_WEIGHTS.find(
        (w: DimensionWeight): boolean =>
          w.dimension === 'root-cause-localization',
      )?.weight ?? 0;

    expect(localization).toBeGreaterThan(0.4);
  });

  it('sums to one', () => {
    const total: number = DEBUGGER_DIMENSION_WEIGHTS.reduce(
      (sum: number, w: DimensionWeight): number => sum + w.weight,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });
});
