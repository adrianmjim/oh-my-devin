import { readFile } from 'node:fs/promises';
import { ArtifactValidationError } from './artifact-validation-error';

export async function readSchema(schemaPath: string): Promise<object> {
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
