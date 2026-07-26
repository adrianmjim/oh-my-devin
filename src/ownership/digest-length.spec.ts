import { describe, expect, it } from 'vitest';
import { DIGEST_LENGTH } from './digest-length';

describe('DIGEST_LENGTH', () => {
  it('keeps half of a sha256 hex digest', () => {
    expect(DIGEST_LENGTH).toBe(32);
  });

  it('stays short enough to sit inline in a marker', () => {
    expect(DIGEST_LENGTH).toBeLessThan(64);
  });
});
