import { describe, expect, it } from 'vitest';
import { REJECT_ANSWERS } from './reject-answers';

describe('REJECT_ANSWERS', () => {
  it('accepts the long and short forms of rejection', () => {
    for (const answer of ['reject', 'r', 'n', 'no']) {
      expect(REJECT_ANSWERS.has(answer)).toBe(true);
    }
  });

  it('accepts no approval wording', () => {
    expect(REJECT_ANSWERS.has('yes')).toBe(false);
  });
});
