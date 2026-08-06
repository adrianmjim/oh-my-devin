import type { BenchFixture } from './bench-fixture';
import type { BenchRole } from './bench-role';

export interface RoleFixtureSet {
  readonly role: BenchRole;
  readonly hypothesis: string;
  readonly fixtures: readonly BenchFixture[];
}
