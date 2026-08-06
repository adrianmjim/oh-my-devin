import { describe, expect, it } from 'vitest';
import { aggregateRoleScore } from './aggregate-role-score';
import type { FixtureScore } from './fixture-score';
import type { RoleBenchScore } from './role-bench-score';
import type { RoleFixtureSet } from './role-fixture-set';

const SET: RoleFixtureSet = {
  role: 'reviewer',
  hypothesis: 'The reviewer prompt makes severity track impact.',
  fixtures: [],
};

function scoreOf(fixtureId: string, composite: number): FixtureScore {
  return {
    fixtureId,
    role: 'reviewer',
    model: 'claude-sonnet-5-medium',
    dimensions: [{ dimension: 'detection', score: composite }],
    composite,
    artifactValid: true,
    failureTier: null,
    validationErrors: [],
  };
}

describe('aggregateRoleScore', () => {
  it('averages the fixture composites into the role composite', () => {
    const score: RoleBenchScore = aggregateRoleScore(
      SET,
      'claude-sonnet-5-medium',
      [scoreOf('a', 1), scoreOf('b', 0.5)],
    );

    expect(score.composite).toBe(0.75);
    expect(score.role).toBe('reviewer');
    expect(score.model).toBe('claude-sonnet-5-medium');
  });

  it('carries the hypothesis the bench answers into the result', () => {
    expect(
      aggregateRoleScore(SET, 'claude-sonnet-5-medium', [scoreOf('a', 1)])
        .hypothesis,
    ).toBe(SET.hypothesis);
  });

  it('scores an empty run as zero rather than dividing by nothing', () => {
    expect(
      aggregateRoleScore(SET, 'claude-sonnet-5-medium', []).composite,
    ).toBe(0);
  });
});
