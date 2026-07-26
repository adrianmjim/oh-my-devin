import { parseTransition } from './parse-transition';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamTransition } from './team-transition';

export function parseWorkflow(
  value: unknown,
  memberRoles: ReadonlySet<string>,
  validNodes: ReadonlySet<string>,
): readonly TeamTransition[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TeamDefinitionError('"workflow" must be a mapping');
  }
  const map: Record<string, unknown> = value as Record<string, unknown>;
  const transitions: TeamTransition[] = [];
  for (const from of Object.keys(map)) {
    if (!memberRoles.has(from)) {
      throw new TeamDefinitionError(
        `workflow stage "${from}" is not a declared member`,
      );
    }
    transitions.push(parseTransition(from, map[from], validNodes));
  }
  return transitions;
}
