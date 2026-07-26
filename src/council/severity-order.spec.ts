import { describe, expect, it } from 'vitest';
import { SEVERITY_ORDER } from './severity-order';

describe('SEVERITY_ORDER', () => {
  it('ranks the severities from least to most severe', () => {
    expect(SEVERITY_ORDER).toEqual(['low', 'medium', 'high', 'critical']);
  });

  it('lists every severity once', () => {
    expect(new Set(SEVERITY_ORDER).size).toBe(SEVERITY_ORDER.length);
  });
});
