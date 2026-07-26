import { describe, expect, it } from 'vitest';
import { OUTCOME_KEY_PATTERN } from './outcome-key-pattern';

describe('OUTCOME_KEY_PATTERN', () => {
  it('captures the outcome named by an on_ key', () => {
    expect(OUTCOME_KEY_PATTERN.exec('on_passed')?.[1]).toBe('passed');
  });

  it('does not match the plain successor key', () => {
    expect(OUTCOME_KEY_PATTERN.exec('then')).toBeNull();
  });
});
