import { describe, expect, it } from 'vitest';
import { isStringArray } from './is-string-array';

describe('isStringArray', () => {
  it('accepts an array of strings', () => {
    expect(isStringArray(['a', 'b'])).toBe(true);
  });

  it('accepts the empty array', () => {
    expect(isStringArray([])).toBe(true);
  });

  it('refuses an array holding a non-string', () => {
    expect(isStringArray(['a', 1])).toBe(false);
  });

  it('refuses a value that is not an array', () => {
    expect(isStringArray('a')).toBe(false);
    expect(isStringArray(null)).toBe(false);
  });
});
