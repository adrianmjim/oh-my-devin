import { describe, expect, it } from 'vitest';
import type { OutcomeGroup } from './outcome-group';
import { OUTCOME_GROUPS } from './outcome-groups';

describe('OUTCOME_GROUPS', () => {
  it('groups the outcomes in reporting order', () => {
    expect(
      OUTCOME_GROUPS.map((group: OutcomeGroup): string => group.outcome),
    ).toEqual([
      'created',
      'updated',
      'unchanged',
      'preserved',
      'conflicted',
      'blocked',
    ]);
  });

  it('heads each group with its capitalized outcome', () => {
    for (const group of OUTCOME_GROUPS) {
      expect(group.heading.toLowerCase()).toBe(`${group.outcome}:`);
    }
  });
});
