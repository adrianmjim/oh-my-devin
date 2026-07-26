import { describe, expect, it } from 'vitest';
import { APPROVE_ANSWERS } from './approve-answers';

describe('APPROVE_ANSWERS', () => {
  it('accepts the long and short forms of approval', () => {
    for (const answer of ['approve', 'a', 'y', 'yes']) {
      expect(APPROVE_ANSWERS.has(answer)).toBe(true);
    }
  });

  it('accepts no rejection wording', () => {
    expect(APPROVE_ANSWERS.has('no')).toBe(false);
  });
});
