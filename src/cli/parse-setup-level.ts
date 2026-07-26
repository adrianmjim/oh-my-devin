import type { InstallLevel } from '../layer/install-level';
import { isInstallLevel } from '../layer/install-level';
import { UsageError } from '../run/usage-error';
import { LEVEL_PREFIX } from './level-prefix';

export function parseSetupLevel(rest: readonly string[]): InstallLevel | null {
  const flag: string | undefined = rest.find((arg: string): boolean =>
    arg.startsWith(LEVEL_PREFIX),
  );
  if (flag === undefined) {
    return null;
  }
  const value: string = flag.slice(LEVEL_PREFIX.length);
  if (!isInstallLevel(value)) {
    throw new UsageError(
      `unknown install level "${value}" (expected: project, user)`,
    );
  }
  return value;
}
