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

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const name: string = entry.name;
    let content: string;
    try {
      content = await readFile(roleDefinitionPath(baseDir, name), 'utf8');
    } catch {
      continue;
    }
    try {
      roles.push(parseRoleDefinition(content, name));
    } catch (error: unknown) {
      errors.push({
        name,
        message: error instanceof Error ? error.message : 'parse error',
      });
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
