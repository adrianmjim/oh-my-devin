import { describe, expect, it } from 'vitest';
import { isReviewerSeverity } from './is-reviewer-severity';

describe('isReviewerSeverity', () => {
  it('accepts the severities the reviewer schema allows', () => {
    expect(isReviewerSeverity('critical')).toBe(true);
    expect(isReviewerSeverity('high')).toBe(true);
    expect(isReviewerSeverity('medium')).toBe(true);
    expect(isReviewerSeverity('low')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isReviewerSeverity('blocker')).toBe(false);
    expect(isReviewerSeverity(undefined)).toBe(false);
  });
});
