import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';

export async function readDirectories(
  path: string,
): Promise<readonly Dirent[]> {
  let entries: readonly Dirent[];
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch {
    entries = [];
  }
  return entries.filter((entry: Dirent): boolean => entry.isDirectory());
}
