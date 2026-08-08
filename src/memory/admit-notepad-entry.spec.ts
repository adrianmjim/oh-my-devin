import { describe, expect, it } from 'vitest';
import { admitNotepadEntry } from './admit-notepad-entry';
import { contentHash } from './content-hash';
import { MEMORY_CLASS_CAP } from './memory-class-cap';
import type { NotepadEntry } from './notepad-entry';
import type { NotepadEntryKind } from './notepad-entry-kind';

function entry(
  text: string,
  recordedAt: number,
  kind: NotepadEntryKind = 'manual',
): NotepadEntry {
  return { kind, text, hash: contentHash(text), recordedAt };
}

function fill(count: number): readonly NotepadEntry[] {
  return Array.from({ length: count }, (_unused: unknown, index: number) =>
    entry(`note ${index}`, index),
  );
}

describe('admitNotepadEntry', () => {
  it('appends an entry the notepad does not hold yet', () => {
    const admitted: readonly NotepadEntry[] = admitNotepadEntry(
      [],
      entry('deploys need the staging gate', 10),
    );

    expect(admitted).toHaveLength(1);
    expect(admitted[0]?.text).toBe('deploys need the staging gate');
  });

  it('collapses identical text to a single entry', () => {
    const first: readonly NotepadEntry[] = admitNotepadEntry(
      [],
      entry('deploys need the staging gate', 10),
    );

    const second: readonly NotepadEntry[] = admitNotepadEntry(
      first,
      entry('deploys need the staging gate', 20),
    );

    expect(second).toHaveLength(1);
    expect(second[0]?.recordedAt).toBe(10);
  });

  it('collapses identical text written under a different kind', () => {
    const first: readonly NotepadEntry[] = admitNotepadEntry(
      [],
      entry('deploys need the staging gate', 10, 'manual'),
    );

    const second: readonly NotepadEntry[] = admitNotepadEntry(
      first,
      entry('deploys need the staging gate', 20, 'priority'),
    );

    expect(second).toHaveLength(1);
  });

  it('holds the notepad within its omd-owned cap', () => {
    const saturated: readonly NotepadEntry[] = fill(MEMORY_CLASS_CAP.notepad);

    const admitted: readonly NotepadEntry[] = admitNotepadEntry(
      saturated,
      entry('one more', 9000),
    );

    expect(admitted).toHaveLength(MEMORY_CLASS_CAP.notepad);
  });

  it('prunes the oldest entries deterministically', () => {
    const saturated: readonly NotepadEntry[] = fill(MEMORY_CLASS_CAP.notepad);

    const once: readonly NotepadEntry[] = admitNotepadEntry(
      saturated,
      entry('one more', 9000),
    );
    const twice: readonly NotepadEntry[] = admitNotepadEntry(
      saturated,
      entry('one more', 9000),
    );

    expect(once).toEqual(twice);
    expect(once[0]?.text).toBe('note 1');
    expect(once[once.length - 1]?.text).toBe('one more');
  });

  it('leaves the entries it was given untouched', () => {
    const existing: readonly NotepadEntry[] = [entry('first', 1)];

    admitNotepadEntry(existing, entry('second', 2));

    expect(existing).toHaveLength(1);
  });
});
