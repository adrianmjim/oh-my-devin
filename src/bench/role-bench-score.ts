import type { BenchRole } from './bench-role';
import type { FixtureScore } from './fixture-score';

export interface RoleBenchScore {
  readonly role: BenchRole;
  readonly model: string;
  readonly hypothesis: string;
  readonly fixtures: readonly FixtureScore[];
  readonly composite: number;
}
