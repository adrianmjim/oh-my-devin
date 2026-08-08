import type { NotepadEntryKind } from './notepad-entry-kind';

export function isNotepadEntryKind(value: unknown): value is NotepadEntryKind {
  return value === 'priority' || value === 'working' || value === 'manual';
}
