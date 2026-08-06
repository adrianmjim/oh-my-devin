import { describe, expect, it } from 'vitest';
import { ARCHITECT_DIMENSION_WEIGHTS } from './architect-dimension-weights';
import { EXECUTOR_DIMENSION_WEIGHTS } from './executor-dimension-weights';
import { REVIEWER_DIMENSION_WEIGHTS } from './reviewer-dimension-weights';
import { roleDimensionWeights } from './role-dimension-weights';

describe('roleDimensionWeights', () => {
  it('returns each role its own weight set', () => {
    expect(roleDimensionWeights('reviewer')).toBe(REVIEWER_DIMENSION_WEIGHTS);
    expect(roleDimensionWeights('architect')).toBe(ARCHITECT_DIMENSION_WEIGHTS);
    expect(roleDimensionWeights('executor')).toBe(EXECUTOR_DIMENSION_WEIGHTS);
  });
});
