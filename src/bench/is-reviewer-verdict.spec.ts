import { describe, expect, it } from 'vitest';
import { isReviewerVerdict } from './is-reviewer-verdict';

describe('isReviewerVerdict', () => {
  it('accepts the verdicts the reviewer schema allows', () => {
    expect(isReviewerVerdict('approve')).toBe(true);
    expect(isReviewerVerdict('request_changes')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isReviewerVerdict('reject')).toBe(false);
    expect(isReviewerVerdict(1)).toBe(false);
  });
});
