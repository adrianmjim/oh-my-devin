import { readFile } from 'node:fs/promises';

export async function readDefinition(path: string): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    content = null;
  }
  return content;
}
