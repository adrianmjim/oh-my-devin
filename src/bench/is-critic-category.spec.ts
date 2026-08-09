import { describe, expect, it } from 'vitest';
import { isCriticCategory } from './is-critic-category';

describe('isCriticCategory', () => {
  it('accepts the two categories the critique distinguishes', () => {
    expect(isCriticCategory('present_flaw')).toBe(true);
    expect(isCriticCategory('missing_element')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isCriticCategory('gap')).toBe(false);
    expect(isCriticCategory(null)).toBe(false);
  });
});
