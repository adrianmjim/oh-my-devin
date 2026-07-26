import { readFile } from 'node:fs/promises';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { LayerLookup } from '../layer/layer-lookup';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { ResolvedRoleDefinition } from '../role/resolved-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { roleSchemaPath } from '../role/role-schema-path';
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
  const resolved: ResolvedRoleDefinition = await resolveRole(lookup, roleName);
  const role: RoleDefinition = resolved.role;
  const schemaPath: string = roleSchemaPath(
    resolved.candidate,
    role.outputSchema,
  );
  const schemaText: string = await readSchemaText(schemaPath, roleName);
  const bundle: AgentConfigBundle = compileBundle(role);
  return { role, schemaText, schemaPath, bundle };
}

async function resolveRole(
  lookup: LayerLookup,
  roleName: string,
): Promise<ResolvedRoleDefinition> {
  try {
    return await loadRoleDefinition(lookup, roleName);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error
        ? error.message
        : `role "${roleName}" could not be resolved`,
    );
  }
}

async function readSchemaText(
  schemaPath: string,
  roleName: string,
): Promise<string> {
  try {
    return await readFile(schemaPath, 'utf8');
  } catch {
    throw new UsageError(
      `role "${roleName}": output schema not found at ${schemaPath}`,
    );
  }
}

function compileBundle(role: RoleDefinition): AgentConfigBundle {
  try {
    return compileAgentConfigBundle(role);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : 'contract compilation failed',
    );
  }
}
