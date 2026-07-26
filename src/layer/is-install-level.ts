import type { InstallLevel } from './install-level';

export function isInstallLevel(value: unknown): value is InstallLevel {
  return value === 'project' || value === 'user';
}
