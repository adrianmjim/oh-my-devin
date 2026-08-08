import type { ExecutorTestsClaim } from './executor-tests-claim';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';
import type { ExecutorVerification } from './executor-verification';

export interface ExecutorTruthDocument {
  readonly role: 'executor';
  readonly expectedTests: ExecutorTestsClaim;
  readonly criteria: readonly ExecutorTruthCriterion[];
  readonly verification: ExecutorVerification;
  readonly protectedPaths: readonly string[];
}
