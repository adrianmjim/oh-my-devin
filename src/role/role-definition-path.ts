import { join } from 'node:path';

export function roleDefinitionPath(baseDir: string, name: string): string {
  return join(baseDir, '.devin', 'agents', name, 'AGENT.md');
}
