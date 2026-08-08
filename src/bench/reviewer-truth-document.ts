import type { ReviewerTruthItem } from './reviewer-truth-item';
import type { ReviewerVerdict } from './reviewer-verdict';

export interface ReviewerTruthDocument {
  readonly role: 'reviewer';
  readonly expectedVerdict: ReviewerVerdict;
  readonly defects: readonly ReviewerTruthItem[];
}
