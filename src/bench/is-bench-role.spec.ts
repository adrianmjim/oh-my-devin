import { describe, expect, it } from 'vitest';
import { isBenchRole } from './is-bench-role';

describe('isBenchRole', () => {
  it('accepts the three seed roles the bench covers', () => {
    expect(isBenchRole('reviewer')).toBe(true);
    expect(isBenchRole('architect')).toBe(true);
    expect(isBenchRole('executor')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isBenchRole('tester')).toBe(false);
    expect(isBenchRole(null)).toBe(false);
  });
});
