import type { BenchRole } from './bench-role';
import type { FixtureManifestEntry } from './fixture-manifest-entry';

export interface FixtureManifest {
  readonly role: BenchRole;
  readonly hypothesis: string;
  readonly fixtures: readonly FixtureManifestEntry[];
}
