import type { NotepadEntry } from './notepad-entry';
import { isNotepadEntryKind } from './is-notepad-entry-kind';

export function isNotepadEntry(value: unknown): value is NotepadEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<NotepadEntry> = value;
  return (
    isNotepadEntryKind(candidate.kind) &&
    typeof candidate.text === 'string' &&
    typeof candidate.hash === 'string' &&
    typeof candidate.recordedAt === 'number'
  );
}
