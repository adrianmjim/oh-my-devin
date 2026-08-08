import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';
import { writeFileAtomically } from './write-file-atomically';

export async function writeNotepad(
  baseDir: string,
  entries: readonly NotepadEntry[],
): Promise<void> {
  const paths: MemoryStorePaths = new MemoryStorePaths(baseDir);
  await writeFileAtomically(
    paths.notepad,
    `${JSON.stringify(entries, null, 2)}\n`,
  );
}
