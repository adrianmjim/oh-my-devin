import { realpath } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function realDirectory(path: string): Promise<string> {
  let resolved: string;
  try {
    resolved = await realpath(path);
  } catch {
    resolved = resolve(path);
  }
  return resolved;
}
