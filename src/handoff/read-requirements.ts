import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function readRequirements(
  baseDir: string,
): Promise<string | null> {
  try {
    return await readFile(join(baseDir, 'requirements.md'), 'utf8');
  } catch {
    return null;
  }
}
