import { isAbsolute, join } from 'node:path';

export function resolveUserConfigDir(
  xdgConfigHome: string | undefined,
  homeDir: string,
): string {
  const base: string =
    xdgConfigHome !== undefined && isAbsolute(xdgConfigHome)
      ? xdgConfigHome
      : join(homeDir, '.config');
  return join(base, 'devin');
}
