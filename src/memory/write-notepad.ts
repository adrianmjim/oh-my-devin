import { mkdir, writeFile } from 'node:fs/promises';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';

export async function writeNotepad(
  baseDir: string,
  entries: readonly NotepadEntry[],
): Promise<void> {
  const paths: MemoryStorePaths = new MemoryStorePaths(baseDir);
  await mkdir(paths.dir, { recursive: true });
  await writeFile(paths.notepad, `${JSON.stringify(entries, null, 2)}\n`);
}
