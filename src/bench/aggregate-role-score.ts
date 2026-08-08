import type { FixtureScore } from './fixture-score';
import type { RoleBenchScore } from './role-bench-score';
import type { RoleFixtureSet } from './role-fixture-set';

export function aggregateRoleScore(
  set: RoleFixtureSet,
  model: string,
  fixtures: readonly FixtureScore[],
): RoleBenchScore {
  const total: number = fixtures.reduce(
    (sum: number, fixture: FixtureScore): number => sum + fixture.composite,
    0,
  );
  return {
    role: set.role,
    model,
    hypothesis: set.hypothesis,
    fixtures,
    composite: fixtures.length === 0 ? 0 : total / fixtures.length,
  };
}
