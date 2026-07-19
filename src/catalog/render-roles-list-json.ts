import type { RoleDefinition } from '../role/role-definition';
import type { RoleListEntry } from './role-list-entry';

export function renderRolesListJson(
  roles: readonly RoleDefinition[],
): readonly RoleListEntry[] {
  return roles.map((role: RoleDefinition): RoleListEntry => ({
    name: role.name,
    output: role.outputArtifact,
    schema: role.outputSchema,
    maxTurns: role.maxTurns,
    context: role.contextPolicy,
    engine: role.engine,
    agentType: role.agentType,
    model: role.model,
  }));
}
