import { readFile } from 'node:fs/promises';
import { UsageError } from './usage-error';

export async function readSchemaText(
  schemaPath: string,
  roleName: string,
): Promise<string> {
  try {
    return await readFile(schemaPath, 'utf8');
  } catch {
    throw new UsageError(
      `role "${roleName}": output schema not found at ${schemaPath}`,
    );
  }
}
