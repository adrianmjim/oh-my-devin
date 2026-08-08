import { describe, expect, it } from 'vitest';
import { ARCHITECT_DIMENSION_WEIGHTS } from './architect-dimension-weights';
import { BenchFixtureError } from './bench-fixture-error';
import type { DimensionScore } from './dimension-score';
import { REVIEWER_DIMENSION_WEIGHTS } from './reviewer-dimension-weights';
import { weightedComposite } from './weighted-composite';

const PERFECT: readonly DimensionScore[] = [
  { dimension: 'detection', score: 1 },
  { dimension: 'false-positive-resistance', score: 1 },
  { dimension: 'severity-accuracy', score: 1 },
  { dimension: 'verdict-accuracy', score: 1 },
];

describe('weightedComposite', () => {
  it('combines dimension scores under their weights', () => {
    const scores: readonly DimensionScore[] = [
      { dimension: 'detection', score: 0.5 },
      { dimension: 'false-positive-resistance', score: 1 },
      { dimension: 'severity-accuracy', score: 0 },
      { dimension: 'verdict-accuracy', score: 1 },
    ];

    expect(weightedComposite(scores, REVIEWER_DIMENSION_WEIGHTS)).toBeCloseTo(
      0.65,
      10,
    );
  });

  it('scores a perfect run as one and an empty run as zero', () => {
    expect(weightedComposite(PERFECT, REVIEWER_DIMENSION_WEIGHTS)).toBe(1);
    expect(
      weightedComposite(
        PERFECT.map((score: DimensionScore): DimensionScore => ({
          dimension: score.dimension,
          score: 0,
        })),
        REVIEWER_DIMENSION_WEIGHTS,
      ),
    ).toBe(0);
  });

  it('stays inside the unit interval for any dimension mix', () => {
    const composite: number = weightedComposite(
      [
        { dimension: 'gap-coverage', score: 0.3 },
        { dimension: 'spurious-step-resistance', score: 0.9 },
      ],
      ARCHITECT_DIMENSION_WEIGHTS,
    );

    expect(composite).toBeGreaterThanOrEqual(0);
    expect(composite).toBeLessThanOrEqual(1);
    expect(composite).toBeCloseTo(0.48, 10);
  });

  it('rejects a weight set the scores do not cover', () => {
    expect(() =>
      weightedComposite(
        [{ dimension: 'detection', score: 1 }],
        REVIEWER_DIMENSION_WEIGHTS,
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a score outside the unit interval', () => {
    expect(() =>
      weightedComposite(
        [
          { dimension: 'gap-coverage', score: 1.2 },
          { dimension: 'spurious-step-resistance', score: 1 },
        ],
        ARCHITECT_DIMENSION_WEIGHTS,
      ),
    ).toThrow(BenchFixtureError);
  });
});
