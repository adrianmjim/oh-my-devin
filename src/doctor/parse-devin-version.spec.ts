import { describe, expect, it } from 'vitest';
import { parseDevinVersion } from './parse-devin-version';

describe('parseDevinVersion', () => {
  it('reads the version out of the banner', () => {
    expect(parseDevinVersion('devin 3000.1.27\n')).toBe('3000.1.27');
  });

  it('is null when no version is present', () => {
    expect(parseDevinVersion('devin')).toBeNull();
  });
});
