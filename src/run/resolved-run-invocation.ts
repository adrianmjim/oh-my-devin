import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { RoleDefinition } from '../role/role-definition';

export interface ResolvedRunInvocation {
  readonly role: RoleDefinition;
  readonly schemaText: string;
  readonly schemaPath: string;
  readonly bundle: AgentConfigBundle;
}
