import type { ReviewerVerdict } from './reviewer-verdict';

export function isReviewerVerdict(value: unknown): value is ReviewerVerdict {
  return value === 'approve' || value === 'request_changes';
}
