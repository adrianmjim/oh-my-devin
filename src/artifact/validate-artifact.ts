import { readFile } from 'node:fs/promises';
import type { ArtifactValidation } from './artifact-validation';
import { ArtifactValidationError } from './artifact-validation-error';
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

async function readSchema(schemaPath: string): Promise<object> {
  let raw: string;
  try {
    raw = await readFile(schemaPath, 'utf8');
  } catch {
    throw new ArtifactValidationError(
      `schema file not found at "${schemaPath}"`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ArtifactValidationError(
      `schema at "${schemaPath}" is not valid JSON`,
    );
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ArtifactValidationError(
      `schema at "${schemaPath}" must be a JSON object`,
    );
  }
  return parsed;
}
