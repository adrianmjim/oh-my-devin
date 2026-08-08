import { describe, expect, it } from 'vitest';
import { isNotepadEntryKind } from './is-notepad-entry-kind';

describe('isNotepadEntryKind', () => {
  it('recognizes every notepad entry kind', () => {
    expect(isNotepadEntryKind('priority')).toBe(true);
    expect(isNotepadEntryKind('working')).toBe(true);
    expect(isNotepadEntryKind('manual')).toBe(true);
  });

  it('rejects anything outside the kind vocabulary', () => {
    expect(isNotepadEntryKind('shouting')).toBe(false);
    expect(isNotepadEntryKind(undefined)).toBe(false);
    expect(isNotepadEntryKind(3)).toBe(false);
  });
});
