import { describe, expect, it } from 'vitest';
import { THEN_PREFIX } from './then-prefix';

describe('THEN_PREFIX', () => {
  it('introduces the inline council follow-up team flag', () => {
    expect(THEN_PREFIX).toBe('--then=');
  });

  it('ends with the assignment character the inline form needs', () => {
    expect(THEN_PREFIX.endsWith('=')).toBe(true);
  });
});
