import { admitNotepadEntry } from './admit-notepad-entry';
import { contentHash } from './content-hash';
import type { NotepadEntry } from './notepad-entry';
import type { NotepadEntryKind } from './notepad-entry-kind';
import { readNotepad } from './read-notepad';
import { writeNotepad } from './write-notepad';

export async function appendNotepadEntry(
  baseDir: string,
  kind: NotepadEntryKind,
  text: string,
  recordedAt: number,
): Promise<readonly NotepadEntry[]> {
  const held: readonly NotepadEntry[] = await readNotepad(baseDir);
  const admitted: readonly NotepadEntry[] = admitNotepadEntry(held, {
    kind,
    text,
    hash: contentHash(text),
    recordedAt,
  });
  await writeNotepad(baseDir, admitted);
  return admitted;
}
