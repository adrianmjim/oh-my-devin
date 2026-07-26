import { layerFilePath } from '../layer/layer-file-path';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleCandidate } from './role-candidate';
import { roleDefinitionRelativePath } from './role-definition-relative-path';

export function roleDefinitionCandidates(
  lookup: LayerLookup,
  name: string,
): readonly RoleCandidate[] {
  const relativePath: string = roleDefinitionRelativePath(name);
  const candidates: RoleCandidate[] = [
    {
      level: 'project',
      baseDir: lookup.projectDir,
      definitionPath: layerFilePath('project', lookup.projectDir, relativePath),
    },
  ];
  const userConfigDir: string | null = lookup.userConfigDir;
  if (userConfigDir !== null) {
    candidates.push({
      level: 'user',
      baseDir: userConfigDir,
      definitionPath: layerFilePath('user', userConfigDir, relativePath),
    });
  }
  return candidates;
}
