import type { LayerLookup } from '../layer/layer-lookup';
import { parseRoleDefinition } from './parse-role-definition';
import { readCandidate } from './read-candidate';
import type { ResolvedRoleDefinition } from './resolved-role-definition';
import type { RoleCandidate } from './role-candidate';
import { roleDefinitionCandidates } from './role-definition-candidates';
import { RoleDefinitionError } from './role-definition-error';

export async function loadRoleDefinition(
  lookup: LayerLookup,
  name: string,
): Promise<ResolvedRoleDefinition> {
  const candidates: readonly RoleCandidate[] = roleDefinitionCandidates(
    lookup,
    name,
  );
  let found: ResolvedRoleDefinition | null = null;
  for (const candidate of candidates) {
    if (found === null) {
      const content: string | null = await readCandidate(candidate);
      if (content !== null) {
        found = { role: parseRoleDefinition(content, name), candidate };
      }
    }
  }
  if (found === null) {
    const tried: string = candidates
      .map((candidate: RoleCandidate): string => candidate.definitionPath)
      .join(' or ');
    throw new RoleDefinitionError(`role "${name}": no AGENT.md at ${tried}`);
  }
  return found;
}
