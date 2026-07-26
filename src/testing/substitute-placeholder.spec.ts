import { describe, expect, it } from 'vitest';
import { substitutePlaceholder } from './substitute-placeholder';

describe('substitutePlaceholder', () => {
  it('substitutes a documented placeholder', () => {
    expect(substitutePlaceholder('<role>')).toBe('reviewer');
  });

  it('leaves any other token untouched', () => {
    expect(substitutePlaceholder('--json')).toBe('--json');
  });
});
