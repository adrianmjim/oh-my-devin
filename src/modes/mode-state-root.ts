import { join } from 'node:path';

export function modeStateRoot(baseDir: string): string {
  return join(baseDir, '.omd', 'modes');
}
