import { MEMORY_CLASS_CAP } from './memory-class-cap';
import type { NotepadEntry } from './notepad-entry';

export function admitNotepadEntry(
  entries: readonly NotepadEntry[],
  candidate: NotepadEntry,
): readonly NotepadEntry[] {
  const held: boolean = entries.some(
    (entry: NotepadEntry): boolean => entry.hash === candidate.hash,
  );
  const admitted: readonly NotepadEntry[] = held
    ? entries
    : [...entries, candidate];
  const overflow: number = admitted.length - MEMORY_CLASS_CAP.notepad;
  return overflow > 0 ? admitted.slice(overflow) : [...admitted];
}
