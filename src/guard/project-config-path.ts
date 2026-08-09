import { join } from 'node:path';

export function projectConfigPath(baseDir: string): string {
  return join(baseDir, '.omd', 'config.yaml');
}
