import { parseMember } from './parse-member';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamMember } from './team-member';

export function parseMembers(
  value: unknown,
  knownRoles: readonly string[],
): readonly TeamMember[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TeamDefinitionError('"members" must be a non-empty list');
  }
  return value.map((entry: unknown, index: number): TeamMember =>
    parseMember(entry, index, knownRoles),
  );
}
