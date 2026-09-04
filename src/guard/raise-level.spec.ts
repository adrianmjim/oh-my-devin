import { describe, expect, it } from 'vitest';
import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import type { EnforcementLevel } from './enforcement-level';
import { raiseLevel } from './raise-level';

describe('raiseLevel', () => {
  it('raises the configured level for an active autopilot', () => {
    expect(raiseLevel('warn', ['autopilot'])).toBe('strict');
    expect(raiseLevel('off', ['autopilot'])).toBe('strict');
  });

  it('leaves the configured level alone without a raising mode', () => {
    expect(raiseLevel('warn', [])).toBe('warn');
    expect(raiseLevel('warn', ['ralph', 'team', 'plan'])).toBe('warn');
  });

  it('never lowers an already stricter configured level', () => {
    for (const level of ALL_ENFORCEMENT_LEVELS) {
      const raised: EnforcementLevel = raiseLevel(level, ['autopilot']);

      expect(ALL_ENFORCEMENT_LEVELS.indexOf(raised)).toBeGreaterThanOrEqual(
        ALL_ENFORCEMENT_LEVELS.indexOf(level),
      );
    }
    expect(raiseLevel('strict', [])).toBe('strict');
  });

  it('takes the highest raise when several modes are active', () => {
    expect(raiseLevel('off', ['deep-dive', 'autopilot'])).toBe('strict');
  });
});
