import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleDefinition } from '../role/role-definition';
import { discoverRoot } from './discover-root';
import type { DiscoveryAccumulator } from './discovery-accumulator';
import { discoveryRoots } from './discovery-roots';
import type { RoleDiscovery } from './role-discovery';
import type { RoleDiscoveryError } from './role-discovery-error';

export async function discoverRoles(
  lookup: LayerLookup,
): Promise<RoleDiscovery> {
  const accumulator: DiscoveryAccumulator = {
    roles: [],
    errors: [],
    seen: new Set<string>(),
  };
  for (const root of discoveryRoots(lookup)) {
    await discoverRoot(root, accumulator);
  }
  accumulator.roles.sort((a: RoleDefinition, b: RoleDefinition): number =>
    a.name.localeCompare(b.name),
  );
  accumulator.errors.sort(
    (a: RoleDiscoveryError, b: RoleDiscoveryError): number =>
      a.name.localeCompare(b.name),
  );
  return { roles: accumulator.roles, errors: accumulator.errors };
}
