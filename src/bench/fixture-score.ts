import type { FailureTier } from '../outcome/failure-tier';
import type { BenchRole } from './bench-role';
import type { DimensionScore } from './dimension-score';

export interface FixtureScore {
  readonly fixtureId: string;
  readonly role: BenchRole;
  readonly model: string;
  readonly dimensions: readonly DimensionScore[];
  readonly composite: number;
  readonly artifactValid: boolean;
  readonly failureTier: FailureTier | null;
  readonly validationErrors: readonly string[];
}
