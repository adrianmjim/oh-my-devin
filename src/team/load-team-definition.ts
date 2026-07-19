import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import type { RoleDefinition } from '../role/role-definition';
import { UsageError } from '../run/usage-error';
import { parseTeamDefinition } from './parse-team-definition';
import type { TeamDefinition } from './team-definition';

export async function loadTeamDefinition(
  baseDir: string,
  name: string,
): Promise<TeamDefinition> {
  const path: string = join(baseDir, '.devin', 'teams', `${name}.yaml`);
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new UsageError(`team "${name}" not found at ${path}`);
  }

  const discovery: RoleDiscovery = await discoverRoles(baseDir);
  const knownRoles: readonly string[] = discovery.roles.map(
    (role: RoleDefinition): string => role.name,
  );

  try {
    return parseTeamDefinition(text, knownRoles);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `team "${name}" is malformed`,
    );
  }
}
