import { describe, expect, it } from 'vitest';
import { SCOPE_PREFIX } from './scope-prefix';

describe('SCOPE_PREFIX', () => {
  it('introduces the inline setup scope flag', () => {
    expect(SCOPE_PREFIX).toBe('--scope=');
  });

  it('ends with the assignment character the inline form needs', () => {
    expect(SCOPE_PREFIX.endsWith('=')).toBe(true);
  });
});
