import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import { ENGINE_LAYER_DIR } from '../layer/engine-layer-dir';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleDefinition } from '../role/role-definition';
import type { WriteScope } from '../role/write-scope';
import { UsageError } from '../run/usage-error';
import type { CouncilDeclaration } from './council-declaration';
import { parseCouncilDeclaration } from './parse-council-declaration';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';

export async function loadCouncilDeclaration(
  lookup: LayerLookup,
  name: string,
): Promise<CouncilDeclaration> {
  const path: string = join(
    lookup.projectDir,
    ENGINE_LAYER_DIR,
    'councils',
    `${name}.yaml`,
  );
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new UsageError(`council "${name}" not found at ${path}`);
  }

  const discovery: RoleDiscovery = await discoverRoles(lookup);
  const roleScopes: RoleWriteScopes = new Map<string, WriteScope>(
    discovery.roles.map((role: RoleDefinition): [string, WriteScope] => [
      role.name,
      role.writeScope,
    ]),
  );

  try {
    return parseCouncilDeclaration(text, roleScopes);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `council "${name}" is malformed`,
    );
  }
}
