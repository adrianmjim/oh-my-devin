import { describe, expect, it } from 'vitest';
import type { TeamDefinition } from '../team/team-definition';
import { stageTransition } from './stage-transition';

const TEAM: TeamDefinition = {
  name: 'feature-team',
  members: [],
  workflow: [
    { from: 'architect', then: 'executor', outcomes: [] },
    { from: 'executor', then: 'reviewer', outcomes: [] },
  ],
};

describe('stageTransition', () => {
  it('finds the transition leaving a stage', () => {
    expect(stageTransition(TEAM, 'executor')?.then).toBe('reviewer');
  });

  it('is null when the workflow declares no transition for the stage', () => {
    expect(stageTransition(TEAM, 'reviewer')).toBeNull();
  });
});
