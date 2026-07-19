import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import type { RoleDefinition } from '../role/role-definition';
import { UsageError } from '../run/usage-error';
import type { CouncilDeclaration } from './council-declaration';
import { parseCouncilDeclaration } from './parse-council-declaration';

export async function loadCouncilDeclaration(
  baseDir: string,
  name: string,
): Promise<CouncilDeclaration> {
  const path: string = join(baseDir, '.devin', 'councils', `${name}.yaml`);
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new UsageError(`council "${name}" not found at ${path}`);
  }

  const discovery: RoleDiscovery = await discoverRoles(baseDir);
  const knownRoles: readonly string[] = discovery.roles.map(
    (role: RoleDefinition): string => role.name,
  );

  try {
    return parseCouncilDeclaration(text, knownRoles);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `council "${name}" is malformed`,
    );
  }
}
