import { AMBIENT_PRIORITY_ENTRY_CAP } from './ambient-priority-entry-cap';
import type { NotepadEntry } from './notepad-entry';

export function selectPriorityEntries(
  entries: readonly NotepadEntry[],
): readonly NotepadEntry[] {
  return entries
    .filter((entry: NotepadEntry): boolean => entry.kind === 'priority')
    .slice(-AMBIENT_PRIORITY_ENTRY_CAP);
}
