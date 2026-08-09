import { describe, expect, it } from 'vitest';
import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import { isEnforcementLevel } from './is-enforcement-level';

describe('isEnforcementLevel', () => {
  it('accepts every level of the ladder', () => {
    for (const level of ALL_ENFORCEMENT_LEVELS) {
      expect(isEnforcementLevel(level)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isEnforcementLevel('block')).toBe(false);
    expect(isEnforcementLevel('WARN')).toBe(false);
    expect(isEnforcementLevel(null)).toBe(false);
    expect(isEnforcementLevel(1)).toBe(false);
    expect(isEnforcementLevel(undefined)).toBe(false);
  });
});
