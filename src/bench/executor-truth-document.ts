import type { ExecutorTestsClaim } from './executor-tests-claim';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';

export interface ExecutorTruthDocument {
  readonly role: 'executor';
  readonly expectedTests: ExecutorTestsClaim;
  readonly criteria: readonly ExecutorTruthCriterion[];
}
