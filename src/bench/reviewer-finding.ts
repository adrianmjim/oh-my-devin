import type { ReviewerSeverity } from './reviewer-severity';

export interface ReviewerFinding {
  readonly severity: ReviewerSeverity;
  readonly location: string;
  readonly summary: string;
  readonly fix: string;
}
