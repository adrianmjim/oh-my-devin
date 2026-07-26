import { describe, expect, it } from 'vitest';
import { dedupeStrings } from './dedupe-strings';

describe('dedupeStrings', () => {
  it('keeps the first occurrence of each value', () => {
    expect(dedupeStrings(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('is empty for no values', () => {
    expect(dedupeStrings([])).toEqual([]);
  });
});
