import { describe, expect, it } from 'vitest';
import { normalizeForDigest } from './normalize-for-digest';

describe('normalizeForDigest', () => {
  it('rewrites carriage-return line endings to newlines', () => {
    expect(normalizeForDigest('alpha\r\nbeta')).toBe('alpha\nbeta');
  });

  it('strips every trailing newline', () => {
    expect(normalizeForDigest('alpha\n\n\n')).toBe('alpha');
  });

  it('keeps per-line trailing whitespace', () => {
    expect(normalizeForDigest('alpha  \nbeta')).toBe('alpha  \nbeta');
  });

  it('leaves already normalized content untouched', () => {
    expect(normalizeForDigest('alpha\nbeta')).toBe('alpha\nbeta');
  });
});
