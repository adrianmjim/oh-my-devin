import { join } from 'node:path';
import type { InstallLevel } from './install-level';
import { userLevelLayerPath } from './user-level-layer-path';

export function layerFilePath(
  level: InstallLevel,
  baseDir: string,
  projectRelativePath: string,
): string {
  return level === 'project'
    ? join(baseDir, projectRelativePath)
    : userLevelLayerPath(baseDir, projectRelativePath);
}
