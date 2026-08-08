import { MEMORY_CLASS_CAP } from './memory-class-cap';
import type { NotepadEntry } from './notepad-entry';

export function admitNotepadEntry(
  entries: readonly NotepadEntry[],
  candidate: NotepadEntry,
): readonly NotepadEntry[] {
  const seen: Set<string> = new Set<string>();
  const collapsed: NotepadEntry[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.hash)) {
      seen.add(entry.hash);
      collapsed.push(entry);
    }
  }
  const admitted: readonly NotepadEntry[] = seen.has(candidate.hash)
    ? collapsed
    : [...collapsed, candidate];
  const overflow: number = admitted.length - MEMORY_CLASS_CAP.notepad;
  return overflow > 0 ? admitted.slice(overflow) : [...admitted];
}
