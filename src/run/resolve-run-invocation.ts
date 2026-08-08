import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { LayerLookup } from '../layer/layer-lookup';
import { composeMemoryDelivery } from '../memory/compose-memory-delivery';
import type { MemoryDelivery } from '../memory/memory-delivery';
import type { ResolvedRoleDefinition } from '../role/resolved-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { roleSchemaPath } from '../role/role-schema-path';
import { compileRunBundle } from './compile-run-bundle';
import { readSchemaText } from './read-schema-text';
import { resolveRoleDefinition } from './resolve-role-definition';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import type { RunExecutionContext } from './run-execution-context';
import { UsageError } from './usage-error';

export async function resolveRunInvocation(
  lookup: LayerLookup,
  roleName: string,
  task: string,
  context: RunExecutionContext,
): Promise<ResolvedRunInvocation> {
  if (task.trim() === '') {
    throw new UsageError('task must be a non-empty string');
  }
  const resolved: ResolvedRoleDefinition = await resolveRoleDefinition(
    lookup,
    roleName,
  );
  const role: RoleDefinition = resolved.role;
  if (role.writeScope === 'worktree' && !context.provisionedWorktree) {
    throw new UsageError(
      `role "${roleName}" declares the "worktree" write scope and runs only inside a worktree omd provisions for it; a standalone run has no isolation, no diff capture, and no gate`,
    );
  }
  const schemaPath: string = roleSchemaPath(
    resolved.candidate,
    role.outputSchema,
  );
  const schemaText: string = await readSchemaText(schemaPath, roleName);
  const memory: MemoryDelivery = await composeMemoryDelivery(
    context.memoryBaseDir ?? context.workingDirectory,
    role.memorySelection,
    Date.now(),
  );
  const bundle: AgentConfigBundle = compileRunBundle(
    role,
    context.workingDirectory,
    memory,
  );
  return { role, schemaText, schemaPath, bundle };
}
