import { describe, expect, it } from 'vitest';
import type { TeamTransition } from '../team/team-transition';
import { outcomeTarget } from './outcome-target';

const TRANSITION: TeamTransition = {
  from: 'reviewer',
  then: 'done',
  outcomes: [
    { outcome: 'passed', to: 'done' },
    { outcome: 'blocked', to: 'executor' },
  ],
};

describe('outcomeTarget', () => {
  it('finds the node a declared outcome routes to', () => {
    expect(outcomeTarget(TRANSITION, 'blocked')).toBe('executor');
  });

  it('is undefined for an outcome the transition does not declare', () => {
    expect(outcomeTarget(TRANSITION, 'skipped')).toBeUndefined();
  });
});
