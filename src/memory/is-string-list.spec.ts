import { describe, expect, it } from 'vitest';
import { isStringList } from './is-string-list';

describe('isStringList', () => {
  it('recognizes an empty list and a list of strings', () => {
    expect(isStringList([])).toBe(true);
    expect(isStringList(['node', 'typescript'])).toBe(true);
  });

  it('rejects a list holding anything but strings', () => {
    expect(isStringList(['node', 7])).toBe(false);
    expect(isStringList([null])).toBe(false);
  });

  it('rejects a value that is not a list', () => {
    expect(isStringList('node')).toBe(false);
    expect(isStringList(null)).toBe(false);
    expect(isStringList({ 0: 'node' })).toBe(false);
  });
});
