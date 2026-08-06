import type { BenchRole } from './bench-role';
import type { FixtureScore } from './fixture-score';

export interface BenchBaseline {
  readonly role: BenchRole;
  readonly promptDigest: string;
  readonly omdVersion: string;
  readonly engineVersion: string;
  readonly model: string;
  readonly fixtures: readonly FixtureScore[];
  readonly composite: number;
}
