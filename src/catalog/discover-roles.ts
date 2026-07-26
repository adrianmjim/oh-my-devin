import { readFile, readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import type { LayerLookup } from '../layer/layer-lookup';
import { userLevelLayerPath } from '../layer/user-level-layer-path';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { ROLES_RELATIVE_DIR } from '../role/roles-relative-dir';
import type { RoleDiscovery } from './role-discovery';
import type { RoleDiscoveryError } from './role-discovery-error';

interface DiscoveryAccumulator {
  readonly roles: RoleDefinition[];
  readonly errors: RoleDiscoveryError[];
  readonly seen: Set<string>;
}

function discoveryRoots(lookup: LayerLookup): readonly string[] {
  const roots: string[] = [join(lookup.projectDir, ROLES_RELATIVE_DIR)];
  const userConfigDir: string | null = lookup.userConfigDir;
  if (userConfigDir !== null) {
    roots.push(userLevelLayerPath(userConfigDir, ROLES_RELATIVE_DIR));
  }
  return roots;
}

async function readDefinition(path: string): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    content = null;
  }
  return content;
}

async function readDirectories(path: string): Promise<readonly Dirent[]> {
  let entries: readonly Dirent[];
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch {
    entries = [];
  }
  return entries.filter((entry: Dirent): boolean => entry.isDirectory());
}

async function discoverRoot(
  agentsDir: string,
  accumulator: DiscoveryAccumulator,
): Promise<void> {
  const directories: readonly Dirent[] = await readDirectories(agentsDir);
  for (const entry of directories) {
    const name: string = entry.name;
    if (!accumulator.seen.has(name)) {
      const content: string | null = await readDefinition(
        join(agentsDir, name, 'AGENT.md'),
      );
      if (content !== null) {
        accumulator.seen.add(name);
        try {
          accumulator.roles.push(parseRoleDefinition(content, name));
        } catch (error: unknown) {
          accumulator.errors.push({
            name,
            message: error instanceof Error ? error.message : 'parse error',
          });
        }
      }
    }
  }
}

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
