import type { LayerLookup } from '../layer/layer-lookup';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { UsageError } from '../run/usage-error';

export async function resolveRole(
  lookup: LayerLookup,
  name: string,
): Promise<RoleDefinition> {
  try {
    return (await loadRoleDefinition(lookup, name)).role;
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `unknown role "${name}"`,
    );
  }
}
