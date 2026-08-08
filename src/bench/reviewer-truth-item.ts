import type { ReviewerSeverity } from './reviewer-severity';

export interface ReviewerTruthItem {
  readonly id: string;
  readonly keywords: readonly string[];
  readonly severity: ReviewerSeverity;
}
