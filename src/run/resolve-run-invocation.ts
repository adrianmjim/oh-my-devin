import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { LayerLookup } from '../layer/layer-lookup';
import type { ResolvedRoleDefinition } from '../role/resolved-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { roleSchemaPath } from '../role/role-schema-path';
import { compileRunBundle } from './compile-run-bundle';
import { readSchemaText } from './read-schema-text';
import { resolveRoleDefinition } from './resolve-role-definition';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import { UsageError } from './usage-error';

export async function resolveRunInvocation(
  lookup: LayerLookup,
  roleName: string,
  task: string,
): Promise<ResolvedRunInvocation> {
  if (task.trim() === '') {
    throw new UsageError('task must be a non-empty string');
  }
  const resolved: ResolvedRoleDefinition = await resolveRoleDefinition(
    lookup,
    roleName,
  );
  const role: RoleDefinition = resolved.role;
  const schemaPath: string = roleSchemaPath(
    resolved.candidate,
    role.outputSchema,
  );
  const schemaText: string = await readSchemaText(schemaPath, roleName);
  const bundle: AgentConfigBundle = compileRunBundle(role);
  return { role, schemaText, schemaPath, bundle };
}
