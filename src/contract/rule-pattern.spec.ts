import { describe, expect, it } from 'vitest';
import { RULE_PATTERN } from './rule-pattern';

describe('RULE_PATTERN', () => {
  it('captures the verb of a bare rule', () => {
    const match: RegExpExecArray | null = RULE_PATTERN.exec('Read');

    expect(match?.[1]).toBe('Read');
    expect(match?.[2]).toBeUndefined();
  });

  it('captures the verb and the pattern of a parameterized rule', () => {
    const match: RegExpExecArray | null =
      RULE_PATTERN.exec('Write(review.json)');

    expect(match?.[1]).toBe('Write');
    expect(match?.[2]).toBe('review.json');
  });

  it('rejects a rule that does not start with a letter', () => {
    expect(RULE_PATTERN.exec('1Write')).toBeNull();
  });

  it('rejects an unbalanced rule', () => {
    expect(RULE_PATTERN.exec('Write(review.json')).toBeNull();
  });
});
