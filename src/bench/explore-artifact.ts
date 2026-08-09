import type { ExploreFinding } from './explore-finding';

export interface ExploreArtifact {
  readonly findings: readonly ExploreFinding[];
  readonly relationships: readonly string[];
}
