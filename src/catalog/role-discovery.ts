import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscoveryError } from './role-discovery-error';

export interface RoleDiscovery {
  readonly roles: readonly RoleDefinition[];
  readonly errors: readonly RoleDiscoveryError[];
}
