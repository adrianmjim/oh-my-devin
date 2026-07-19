import { readFile } from 'node:fs/promises';
import { parseRoleDefinition } from './parse-role-definition';
import type { RoleDefinition } from './role-definition';
import { RoleDefinitionError } from './role-definition-error';
import { roleDefinitionPath } from './role-definition-path';

export async function loadRoleDefinition(
  baseDir: string,
  name: string,
): Promise<RoleDefinition> {
  const path: string = roleDefinitionPath(baseDir, name);
  let content: string;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    throw new RoleDefinitionError(`role "${name}": no AGENT.md at ${path}`);
  }
  return parseRoleDefinition(content, name);
}
