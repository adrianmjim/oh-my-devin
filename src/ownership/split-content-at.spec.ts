import { describe, expect, it } from 'vitest';
import { splitContentAt } from './split-content-at';

describe('splitContentAt', () => {
  it('cuts the content at the boundary', () => {
    expect(splitContentAt('abcdef', 3)).toEqual({
      preamble: 'abc',
      rest: 'def',
    });
  });

  it('yields an empty preamble at the start', () => {
    expect(splitContentAt('abc', 0)).toEqual({ preamble: '', rest: 'abc' });
  });

  it('yields an empty rest at the end', () => {
    expect(splitContentAt('abc', 3)).toEqual({ preamble: 'abc', rest: '' });
  });
});
