import { describe, expect, it } from 'vitest';
import { contentHash } from './content-hash';

describe('contentHash', () => {
  it('gives identical text an identical hash', () => {
    expect(contentHash('ship the store first')).toBe(
      contentHash('ship the store first'),
    );
  });

  it('gives differing text a differing hash', () => {
    expect(contentHash('ship the store first')).not.toBe(
      contentHash('ship detection first'),
    );
  });

  it('is a stable hexadecimal digest', () => {
    expect(contentHash('ship the store first')).toMatch(/^[0-9a-f]{64}$/);
  });
});
