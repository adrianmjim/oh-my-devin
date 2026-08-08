import { describe, expect, it } from 'vitest';
import { isStagedRule } from './is-staged-rule';

describe('isStagedRule', () => {
  it('recognizes a staged rule', () => {
    expect(
      isStagedRule({
        text: 'the data owner reviews migrations',
        hash: 'abc',
        stagedAt: 100,
        deliveredAt: null,
      }),
    ).toBe(true);
  });

  it('rejects staging that lost a field', () => {
    expect(isStagedRule({ text: 'a rule', hash: 'abc' })).toBe(false);
    expect(isStagedRule(null)).toBe(false);
  });
});
