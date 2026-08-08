export interface ExecutorTruthCriterion {
  readonly id: string;
  readonly keywords: readonly string[];
  readonly path: string;
  readonly contains: readonly string[];
}
