import { readFile } from 'node:fs/promises';
import type { ArtifactValidation } from './artifact-validation';
import { readSchema } from './read-schema';
import { validateAgainstSchema } from './validate-against-schema';

export async function validateArtifact(
  artifactPath: string,
  schemaPath: string,
): Promise<ArtifactValidation> {
  const schema: object = await readSchema(schemaPath);

  let content: string;
  try {
    content = await readFile(artifactPath, 'utf8');
  } catch {
    return {
      valid: false,
      missing: true,
      errors: [`artifact is missing at "${artifactPath}"`],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      valid: false,
      missing: false,
      errors: [`artifact at "${artifactPath}" is not valid JSON`],
    };
  }

  const errors: readonly string[] = validateAgainstSchema(parsed, schema);
  return { valid: errors.length === 0, missing: false, errors };
}
