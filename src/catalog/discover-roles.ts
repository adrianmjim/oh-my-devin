import { readFile, readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { parseRoleDefinition } from '../role/parse-role-definition';
import { roleDefinitionPath } from '../role/role-definition-path';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import type { RoleDiscoveryError } from './role-discovery-error';

export async function discoverRoles(baseDir: string): Promise<RoleDiscovery> {
  const agentsDir: string = join(baseDir, '.devin', 'agents');

  let entries: Dirent[];
  try {
    entries = await readdir(agentsDir, { withFileTypes: true });
  } catch {
    return { roles: [], errors: [] };
  }

  const roles: RoleDefinition[] = [];
  const errors: RoleDiscoveryError[] = [];

  const directories: Dirent[] = entries.filter((entry: Dirent): boolean =>
    entry.isDirectory(),
  );
  for (const entry of directories) {
    const name: string = entry.name;
    let content: string | null;
    try {
      content = await readFile(roleDefinitionPath(baseDir, name), 'utf8');
    } catch {
      content = null;
    }
    if (content !== null) {
      try {
        roles.push(parseRoleDefinition(content, name));
      } catch (error: unknown) {
        errors.push({
          name,
          message: error instanceof Error ? error.message : 'parse error',
        });
      }
    }
  }

  roles.sort((a: RoleDefinition, b: RoleDefinition): number =>
    a.name.localeCompare(b.name),
  );
  errors.sort((a: RoleDiscoveryError, b: RoleDiscoveryError): number =>
    a.name.localeCompare(b.name),
  );
  return { roles, errors };
}
