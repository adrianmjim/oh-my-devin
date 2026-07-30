import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';
import { ENGINE_LAYER_DIR } from '../layer/engine-layer-dir';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleDefinition } from '../role/role-definition';
import type { WriteScope } from '../role/write-scope';
import { UsageError } from '../run/usage-error';
import { DEFAULT_TEAM_NAME } from './default-team-name';
import { parseTeamDefinition } from './parse-team-definition';
import type { TeamDefinition } from './team-definition';

export async function loadTeamDefinition(
  lookup: LayerLookup,
  name: string,
): Promise<TeamDefinition> {
  const path: string = join(
    lookup.projectDir,
    ENGINE_LAYER_DIR,
    'teams',
    `${name}.yaml`,
  );
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    const remedy: string =
      name === DEFAULT_TEAM_NAME
        ? `no default team found at ${path}; run "omd setup" to install it`
        : `team "${name}" not found at ${path}`;
    throw new UsageError(remedy);
  }

  const discovery: RoleDiscovery = await discoverRoles(lookup);
  const roleScopes: RoleWriteScopes = new Map<string, WriteScope>(
    discovery.roles.map((role: RoleDefinition): [string, WriteScope] => [
      role.name,
      role.writeScope,
    ]),
  );

  try {
    return parseTeamDefinition(text, roleScopes);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `team "${name}" is malformed`,
    );
  }
}
