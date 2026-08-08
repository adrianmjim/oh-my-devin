import { describe, expect, it } from 'vitest';
import { isRuleEntry } from './is-rule-entry';

describe('isRuleEntry', () => {
  it('recognizes a rule carrying its path globs', () => {
    expect(
      isRuleEntry({
        text: 'migrations are reviewed by the data owner',
        globs: ['db/migrations/**'],
        hash: 'abc',
        recordedAt: 10,
      }),
    ).toBe(true);
  });

  it('rejects a rule carrying no globs of its own', () => {
    expect(isRuleEntry({ text: 'a rule', hash: 'abc', recordedAt: 10 })).toBe(
      false,
    );
    expect(
      isRuleEntry({
        text: 'a rule',
        globs: 'db/**',
        hash: 'abc',
        recordedAt: 10,
      }),
    ).toBe(false);
  });
});
