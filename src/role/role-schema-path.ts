import { layerFilePath } from '../layer/layer-file-path';
import type { RoleCandidate } from './role-candidate';

export function roleSchemaPath(
  candidate: RoleCandidate,
  outputSchema: string,
): string {
  return layerFilePath(candidate.level, candidate.baseDir, outputSchema);
}
