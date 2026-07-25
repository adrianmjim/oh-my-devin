import { join } from 'node:path';

export function resolveUserConfigDir(
  xdgConfigHome: string | undefined,
  homeDir: string,
): string {
  const base: string =
    xdgConfigHome !== undefined && xdgConfigHome.trim() !== ''
      ? xdgConfigHome
      : join(homeDir, '.config');
  return join(base, 'devin');
}
