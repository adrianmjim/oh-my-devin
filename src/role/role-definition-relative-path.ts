import { join } from 'node:path';
import { ROLES_RELATIVE_DIR } from './roles-relative-dir';

export function roleDefinitionRelativePath(name: string): string {
  return join(ROLES_RELATIVE_DIR, name, 'AGENT.md');
}
