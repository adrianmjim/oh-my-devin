import { describe, expect, it } from 'vitest';
import { isStringOrNull } from './is-string-or-null';

describe('isStringOrNull', () => {
  it('accepts a string', () => {
    expect(isStringOrNull('review.json')).toBe(true);
  });

  it('accepts null', () => {
    expect(isStringOrNull(null)).toBe(true);
  });

  it('rejects undefined and other types', () => {
    expect(isStringOrNull(undefined)).toBe(false);
    expect(isStringOrNull(7)).toBe(false);
  });
});
