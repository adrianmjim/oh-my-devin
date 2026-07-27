import { describe, expect, it } from 'vitest';
import { isHeadingLine } from './is-heading-line';

describe('isHeadingLine', () => {
  it('recognizes a section heading', () => {
    expect(isHeadingLine('## Mission')).toBe(true);
  });

  it('does not recognize a hash that is not heading markup', () => {
    expect(isHeadingLine('#not-a-heading is the tag.')).toBe(false);
  });

  it('does not recognize ordinary prose', () => {
    expect(isHeadingLine('You are the architect.')).toBe(false);
  });
});
