import { join } from 'node:path';
import type { LayerLookup } from '../layer/layer-lookup';
import { userLevelLayerPath } from '../layer/user-level-layer-path';
import { ROLES_RELATIVE_DIR } from '../role/roles-relative-dir';

export function discoveryRoots(lookup: LayerLookup): readonly string[] {
  const roots: string[] = [join(lookup.projectDir, ROLES_RELATIVE_DIR)];
  const userConfigDir: string | null = lookup.userConfigDir;
  if (userConfigDir !== null) {
    roots.push(userLevelLayerPath(userConfigDir, ROLES_RELATIVE_DIR));
  }
  return roots;
}
