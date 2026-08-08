import type { RoleBenchScore } from './role-bench-score';

export interface SaveBaselineOptions {
  readonly score: RoleBenchScore;
  readonly expectedFixtureIds: readonly string[];
  readonly promptDigest: string;
  readonly omdVersion: string;
  readonly engineVersion: string;
  readonly baselinesDir: string;
  readonly requested: boolean;
}
