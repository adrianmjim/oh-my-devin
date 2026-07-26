import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { RoleDefinition } from '../role/role-definition';
import { UsageError } from './usage-error';

export function compileRunBundle(role: RoleDefinition): AgentConfigBundle {
  try {
    return compileAgentConfigBundle(role);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : 'contract compilation failed',
    );
  }
}
