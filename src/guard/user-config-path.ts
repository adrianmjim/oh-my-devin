import { dirname, join } from 'node:path';

export function userConfigPath(userConfigDir: string): string {
  return join(dirname(userConfigDir), 'omd', 'config.yaml');
}
