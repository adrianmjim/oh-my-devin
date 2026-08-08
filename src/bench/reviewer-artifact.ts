import type { ReviewerFinding } from './reviewer-finding';
import type { ReviewerVerdict } from './reviewer-verdict';

export interface ReviewerArtifact {
  readonly verdict: ReviewerVerdict;
  readonly findings: readonly ReviewerFinding[];
}
