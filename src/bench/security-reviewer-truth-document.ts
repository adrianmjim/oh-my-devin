import type { ReviewerTruthItem } from './reviewer-truth-item';
import type { ReviewerVerdict } from './reviewer-verdict';

export interface SecurityReviewerTruthDocument {
  readonly role: 'security-reviewer';
  readonly expectedVerdict: ReviewerVerdict;
  readonly vulnerabilities: readonly ReviewerTruthItem[];
}
