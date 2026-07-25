export type InstallLevel = 'project' | 'user';

export const ALL_INSTALL_LEVELS: readonly InstallLevel[] = ['project', 'user'];

export function isInstallLevel(value: unknown): value is InstallLevel {
  return value === 'project' || value === 'user';
}
