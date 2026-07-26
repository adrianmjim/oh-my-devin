import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscoveryError } from './role-discovery-error';

export interface DiscoveryAccumulator {
  readonly roles: RoleDefinition[];
  readonly errors: RoleDiscoveryError[];
  readonly seen: Set<string>;
}
