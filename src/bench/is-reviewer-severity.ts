import type { ReviewerSeverity } from './reviewer-severity';

export function isReviewerSeverity(value: unknown): value is ReviewerSeverity {
  return (
    value === 'critical' ||
    value === 'high' ||
    value === 'medium' ||
    value === 'low'
  );
}
