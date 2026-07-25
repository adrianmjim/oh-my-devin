import { readFile } from 'node:fs/promises';
import type { LayerLookup } from '../layer/layer-lookup';
import { parseRoleDefinition } from './parse-role-definition';
import type { ResolvedRoleDefinition } from './resolved-role-definition';
import type { RoleCandidate } from './role-candidate';
import { roleDefinitionCandidates } from './role-definition-candidates';
import { RoleDefinitionError } from './role-definition-error';

async function readCandidate(candidate: RoleCandidate): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(candidate.definitionPath, 'utf8');
  } catch {
    content = null;
  }
  return content;
}

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
