import type { CriticFinding } from './critic-finding';
import type { ReviewerVerdict } from './reviewer-verdict';

export interface CriticArtifact {
  readonly verdict: ReviewerVerdict;
  readonly findings: readonly CriticFinding[];
}
