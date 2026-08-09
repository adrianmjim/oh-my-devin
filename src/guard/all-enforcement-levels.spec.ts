import { describe, expect, it } from 'vitest';
import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';

describe('ALL_ENFORCEMENT_LEVELS', () => {
  it('holds the ladder from least to most enforcing', () => {
    expect(ALL_ENFORCEMENT_LEVELS).toEqual(['off', 'warn', 'ask', 'strict']);
  });

  it('names every level exactly once', () => {
    expect(new Set(ALL_ENFORCEMENT_LEVELS).size).toBe(
      ALL_ENFORCEMENT_LEVELS.length,
    );
  });
});
