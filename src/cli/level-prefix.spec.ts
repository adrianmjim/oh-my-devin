import { describe, expect, it } from 'vitest';
import { LEVEL_PREFIX } from './level-prefix';

describe('LEVEL_PREFIX', () => {
  it('introduces the inline setup level flag', () => {
    expect(LEVEL_PREFIX).toBe('--level=');
  });

  it('ends with the assignment character the inline form needs', () => {
    expect(LEVEL_PREFIX.endsWith('=')).toBe(true);
  });
});
