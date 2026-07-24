import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import { UsageError } from './usage-error';

export async function resolveRunInvocation(
  baseDir: string,
  roleName: string,
  task: string,
): Promise<ResolvedRunInvocation> {
  if (task.trim() === '') {
    throw new UsageError('task must be a non-empty string');
  }
  const role: RoleDefinition = await resolveRole(baseDir, roleName);
  const schemaText: string = await readSchemaText(
    join(baseDir, role.outputSchema),
    roleName,
  );
  const bundle: AgentConfigBundle = compileBundle(role);
  return { role, schemaText, bundle };
}

async function resolveRole(
  baseDir: string,
  roleName: string,
): Promise<RoleDefinition> {
  try {
    return await loadRoleDefinition(baseDir, roleName);
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
