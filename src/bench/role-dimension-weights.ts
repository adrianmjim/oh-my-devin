import { ANALYST_DIMENSION_WEIGHTS } from './analyst-dimension-weights';
import { ARCHITECT_DIMENSION_WEIGHTS } from './architect-dimension-weights';
import type { BenchRole } from './bench-role';
import { CRITIC_DIMENSION_WEIGHTS } from './critic-dimension-weights';
import { DEBUGGER_DIMENSION_WEIGHTS } from './debugger-dimension-weights';
import type { DimensionWeight } from './dimension-weight';
import { DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS } from './document-specialist-dimension-weights';
import { EXECUTOR_DIMENSION_WEIGHTS } from './executor-dimension-weights';
import { EXPLORE_DIMENSION_WEIGHTS } from './explore-dimension-weights';
import { REVIEWER_DIMENSION_WEIGHTS } from './reviewer-dimension-weights';
import { SECURITY_REVIEWER_DIMENSION_WEIGHTS } from './security-reviewer-dimension-weights';

export function roleDimensionWeights(
  role: BenchRole,
): readonly DimensionWeight[] {
  const weights: Record<BenchRole, readonly DimensionWeight[]> = {
    reviewer: REVIEWER_DIMENSION_WEIGHTS,
    architect: ARCHITECT_DIMENSION_WEIGHTS,
    executor: EXECUTOR_DIMENSION_WEIGHTS,
    critic: CRITIC_DIMENSION_WEIGHTS,
    analyst: ANALYST_DIMENSION_WEIGHTS,
    'security-reviewer': SECURITY_REVIEWER_DIMENSION_WEIGHTS,
    debugger: DEBUGGER_DIMENSION_WEIGHTS,
    explore: EXPLORE_DIMENSION_WEIGHTS,
    'document-specialist': DOCUMENT_SPECIALIST_DIMENSION_WEIGHTS,
  };
  return weights[role];
}
