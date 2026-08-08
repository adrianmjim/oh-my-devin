import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { MemoryDelivery } from '../memory/memory-delivery';
import type { RoleDefinition } from '../role/role-definition';
import { UsageError } from './usage-error';

export function compileRunBundle(
  role: RoleDefinition,
  workingDirectory: string,
  memory: MemoryDelivery,
): AgentConfigBundle {
  try {
    return compileAgentConfigBundle(role, workingDirectory, memory);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : 'contract compilation failed',
    );
  }
}
