export type TeamStrategy = 'parallel' | 'independent';

export function isTeamStrategy(value: unknown): value is TeamStrategy {
  return value === 'parallel' || value === 'independent';
}
