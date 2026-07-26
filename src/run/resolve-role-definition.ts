import type { LayerLookup } from '../layer/layer-lookup';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { ResolvedRoleDefinition } from '../role/resolved-role-definition';
import { UsageError } from './usage-error';

export async function resolveRoleDefinition(
  lookup: LayerLookup,
  roleName: string,
): Promise<ResolvedRoleDefinition> {
  try {
    return await loadRoleDefinition(lookup, roleName);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error
        ? error.message
        : `role "${roleName}" could not be resolved`,
    );
  }
}
