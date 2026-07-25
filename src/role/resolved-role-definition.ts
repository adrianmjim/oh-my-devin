import type { RoleCandidate } from './role-candidate';
import type { RoleDefinition } from './role-definition';

export interface ResolvedRoleDefinition {
  readonly role: RoleDefinition;
  readonly candidate: RoleCandidate;
}
