import type { BenchDimension } from './bench-dimension';
import { BenchFixtureError } from './bench-fixture-error';
import type { DimensionScore } from './dimension-score';
import type { DimensionWeight } from './dimension-weight';

export function weightedComposite(
  scores: readonly DimensionScore[],
  weights: readonly DimensionWeight[],
): number {
  const scored: ReadonlyMap<BenchDimension, number> = new Map(
    scores.map((score: DimensionScore): [BenchDimension, number] => [
      score.dimension,
      score.score,
    ]),
  );
  let composite: number = 0;
  for (const weight of weights) {
    const score: number | undefined = scored.get(weight.dimension);
    if (score === undefined) {
      throw new BenchFixtureError(
        `dimension "${weight.dimension}" has no score to weight`,
      );
    }
    if (score < 0 || score > 1) {
      throw new BenchFixtureError(
        `dimension "${weight.dimension}" scored ${score} outside [0,1]`,
      );
    }
    composite += score * weight.weight;
  }
  return composite;
}
