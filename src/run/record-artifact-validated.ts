import type { ArtifactValidation } from '../artifact/artifact-validation';
import type { RunObserver } from '../observability/run-observer';
import type { RoleDefinition } from '../role/role-definition';

export async function recordArtifactValidated(
  recorder: RunObserver | undefined,
  timestamp: number,
  role: RoleDefinition,
  validation: ArtifactValidation,
): Promise<void> {
  await recorder?.append({
    type: 'artifactValidated',
    timestamp,
    artifactPath: role.outputArtifact,
    valid: validation.valid,
    missing: validation.missing,
  });
}
