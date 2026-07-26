import { describe, expect, it } from 'vitest';
import { OUT_PREFIX } from './out-prefix';

describe('OUT_PREFIX', () => {
  it('introduces the inline plugin build output flag', () => {
    expect(OUT_PREFIX).toBe('--out=');
  });

  it('ends with the assignment character the inline form needs', () => {
    expect(OUT_PREFIX.endsWith('=')).toBe(true);
  });
});
