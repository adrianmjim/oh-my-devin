import { describe, expect, it } from 'vitest';
import { isNotepadEntry } from './is-notepad-entry';

describe('isNotepadEntry', () => {
  it('recognizes a well-formed entry of every kind', () => {
    for (const kind of ['priority', 'working', 'manual']) {
      expect(
        isNotepadEntry({ kind, text: 'a note', hash: 'abc', recordedAt: 7 }),
      ).toBe(true);
    }
  });

  it('rejects an unrecognized kind', () => {
    expect(
      isNotepadEntry({
        kind: 'shouting',
        text: 'a note',
        hash: 'abc',
        recordedAt: 7,
      }),
    ).toBe(false);
  });

  it('rejects a value that is not an entry object', () => {
    expect(isNotepadEntry('a note')).toBe(false);
    expect(isNotepadEntry(null)).toBe(false);
    expect(isNotepadEntry(['a note'])).toBe(false);
  });

  it('rejects an entry with a missing or mistyped field', () => {
    expect(
      isNotepadEntry({ kind: 'manual', text: 'a note', hash: 'abc' }),
    ).toBe(false);
    expect(
      isNotepadEntry({
        kind: 'manual',
        text: 'a note',
        hash: 'abc',
        recordedAt: 'soon',
      }),
    ).toBe(false);
  });
});
