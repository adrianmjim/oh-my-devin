import { describe, expect, it } from 'vitest';
import { normalizeBenchText } from './normalize-bench-text';

describe('normalizeBenchText', () => {
  it('lowercases and collapses punctuation into single spaces', () => {
    expect(normalizeBenchText('Null  deref, in `parse()`!')).toBe(
      ' null deref in parse ',
    );
  });

  it('pads the result so a keyword match respects word boundaries', () => {
    expect(normalizeBenchText('index')).toBe(' index ');
  });

  it('normalizes an empty string to a single boundary', () => {
    expect(normalizeBenchText('   ')).toBe(' ');
  });
});
