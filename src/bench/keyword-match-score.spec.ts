import { describe, expect, it } from 'vitest';
import { keywordMatchScore } from './keyword-match-score';

describe('keywordMatchScore', () => {
  it('scores the fraction of keywords the text carries', () => {
    expect(
      keywordMatchScore('The loop is unbounded and never terminates', [
        'unbounded',
        'loop',
      ]),
    ).toBe(1);
    expect(keywordMatchScore('The loop is fine', ['unbounded', 'loop'])).toBe(
      0.5,
    );
    expect(keywordMatchScore('Nothing relevant here', ['unbounded'])).toBe(0);
  });

  it('anchors a keyword at a word start rather than anywhere inside a word', () => {
    expect(keywordMatchScore('unbounded', ['bound'])).toBe(0);
    expect(keywordMatchScore('a bound is set', ['bound'])).toBe(1);
  });

  it('matches an inflected form so fixtures need no exact word form', () => {
    expect(keywordMatchScore('the loop never terminates', ['terminate'])).toBe(
      1,
    );
    expect(keywordMatchScore('two indexes drift', ['index'])).toBe(1);
  });

  it('matches a multi-word keyword as a contiguous phrase', () => {
    expect(keywordMatchScore('it drops the null check', ['null check'])).toBe(1);
    expect(keywordMatchScore('null and check', ['null check'])).toBe(0);
  });

  it('ignores case and punctuation on both sides', () => {
    expect(keywordMatchScore('Off-by-one!', ['off by one'])).toBe(1);
  });

  it('scores an empty keyword set as no match', () => {
    expect(keywordMatchScore('anything', [])).toBe(0);
  });
});
