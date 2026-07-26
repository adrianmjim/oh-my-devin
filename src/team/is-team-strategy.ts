import type { TeamStrategy } from './team-strategy';

export function isTeamStrategy(value: unknown): value is TeamStrategy {
  return value === 'parallel' || value === 'independent';
}
