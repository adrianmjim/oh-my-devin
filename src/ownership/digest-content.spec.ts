import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';

describe('digestContent', () => {
  it('digests the same content equally across line-ending styles', () => {
    expect(digestContent('alpha\r\nbeta\r\n')).toBe(
      digestContent('alpha\nbeta\n'),
    );
  });

  it('digests the same content equally across trailing newlines', () => {
    expect(digestContent('alpha\nbeta')).toBe(digestContent('alpha\nbeta\n\n'));
  });

  it('digests content differing in per-line trailing whitespace differently', () => {
    expect(digestContent('alpha \nbeta')).not.toBe(
      digestContent('alpha\nbeta'),
    );
  });

  it('names the algorithm it used and carries no whitespace', () => {
    const digest: string = digestContent('alpha');

    expect(digest.startsWith('sha256:')).toBe(true);
    expect(digest).not.toMatch(/\s/);
  });

  it('digests different content differently', () => {
    expect(digestContent('alpha')).not.toBe(digestContent('beta'));
  });
});
