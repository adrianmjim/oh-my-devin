import { describe, expect, it } from 'vitest';
import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import { DEFAULT_ENFORCEMENT_LEVEL } from './default-enforcement-level';

describe('DEFAULT_ENFORCEMENT_LEVEL', () => {
  it('defaults the write contract to warn', () => {
    expect(DEFAULT_ENFORCEMENT_LEVEL).toBe('warn');
  });

  it('names a level of the ladder', () => {
    expect(ALL_ENFORCEMENT_LEVELS).toContain(DEFAULT_ENFORCEMENT_LEVEL);
  });
});
