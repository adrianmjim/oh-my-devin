import { describe, expect, it } from 'vitest';
import { AMBIENT_PRIORITY_ENTRY_CAP } from './ambient-priority-entry-cap';
import type { NotepadEntry } from './notepad-entry';
import type { NotepadEntryKind } from './notepad-entry-kind';
import { selectPriorityEntries } from './select-priority-entries';

function entry(
  text: string,
  kind: NotepadEntryKind = 'priority',
  recordedAt: number = 1,
): NotepadEntry {
  return { kind, text, hash: text, recordedAt };
}

describe('selectPriorityEntries', () => {
  it('selects exactly the priority entries', () => {
    const selected: readonly NotepadEntry[] = selectPriorityEntries([
      entry('a priority'),
      entry('a manual note', 'manual'),
      entry('a working note', 'working'),
    ]);

    expect(selected.map((held: NotepadEntry): string => held.text)).toEqual([
      'a priority',
    ]);
  });

  it('bounds the selection to the ambient cap', () => {
    const many: readonly NotepadEntry[] = Array.from(
      { length: AMBIENT_PRIORITY_ENTRY_CAP + 3 },
      (_unused: unknown, index: number): NotepadEntry =>
        entry(`priority ${index}`, 'priority', index),
    );

    expect(selectPriorityEntries(many)).toHaveLength(
      AMBIENT_PRIORITY_ENTRY_CAP,
    );
  });

  it('keeps the most recently recorded entries when it must choose', () => {
    const many: readonly NotepadEntry[] = Array.from(
      { length: AMBIENT_PRIORITY_ENTRY_CAP + 1 },
      (_unused: unknown, index: number): NotepadEntry =>
        entry(`priority ${index}`, 'priority', index),
    );

    const selected: readonly NotepadEntry[] = selectPriorityEntries(many);

    expect(selected[selected.length - 1]?.text).toBe(
      `priority ${String(AMBIENT_PRIORITY_ENTRY_CAP)}`,
    );
    expect(selected[0]?.text).toBe('priority 1');
  });

  it('selects nothing from an empty notepad', () => {
    expect(selectPriorityEntries([])).toEqual([]);
  });
});
