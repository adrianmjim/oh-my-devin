import type { InstallLevel } from '../layer/install-level';

export interface RoleCandidate {
  readonly level: InstallLevel;
  readonly baseDir: string;
  readonly definitionPath: string;
}
