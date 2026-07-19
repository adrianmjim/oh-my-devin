import type { RolePermissions } from '../role/role-permissions';

export interface AgentConfigBundle {
  readonly system_instructions: readonly string[];
  readonly allowed_tools: readonly string[];
  readonly permissions: RolePermissions;
}
