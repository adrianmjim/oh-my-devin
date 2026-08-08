import type { BenchRunMode } from './bench-run-mode';
import type { RoleBenchScore } from './role-bench-score';

export interface FinalizeRoleBenchOptions {
  readonly score: RoleBenchScore;
  readonly expectedFixtureIds: readonly string[];
  readonly mode: BenchRunMode;
  readonly env: Record<string, string | undefined>;
  readonly resultsDir: string;
  readonly baselinesDir: string;
}
