import { join, sep } from 'node:path';
import { ENGINE_LAYER_DIR } from './engine-layer-dir';

export function userLevelLayerPath(
  userConfigDir: string,
  projectRelativePath: string,
): string {
  const segments: readonly string[] = projectRelativePath.split(sep);
  const rebased: readonly string[] =
    segments[0] === ENGINE_LAYER_DIR ? segments.slice(1) : segments;
  return join(userConfigDir, ...rebased);
}
