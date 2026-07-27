import { describe, expect, it } from 'vitest';
import { SETEXT_UNDERLINE_PATTERN } from './setext-underline-pattern';

describe('SETEXT_UNDERLINE_PATTERN', () => {
  it('matches an underline of equals signs', () => {
    expect(SETEXT_UNDERLINE_PATTERN.test('=')).toBe(true);
    expect(SETEXT_UNDERLINE_PATTERN.test('=========')).toBe(true);
  });

  it('matches an underline of dashes', () => {
    expect(SETEXT_UNDERLINE_PATTERN.test('---')).toBe(true);
  });

  it('does not match a list item', () => {
    expect(SETEXT_UNDERLINE_PATTERN.test('- an item')).toBe(false);
  });

  it('does not match ordinary prose', () => {
    expect(SETEXT_UNDERLINE_PATTERN.test('You are the architect.')).toBe(false);
  });
});
