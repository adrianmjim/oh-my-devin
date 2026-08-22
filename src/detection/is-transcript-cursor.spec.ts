import { describe, expect, it } from 'vitest';
import { isTranscriptCursor } from './is-transcript-cursor';

describe('isTranscriptCursor', () => {
  it('reads a well-formed cursor', () => {
    expect(isTranscriptCursor({ sessionId: 'sess-1', lastRowId: 7 })).toBe(
      true,
    );
  });

  it('rejects a cursor naming no session', () => {
    expect(isTranscriptCursor({ lastRowId: 7 })).toBe(false);
  });

  it('rejects a cursor whose row id is not a number', () => {
    expect(isTranscriptCursor({ sessionId: 'sess-1', lastRowId: '7' })).toBe(
      false,
    );
  });

  it('rejects a value that is not an object', () => {
    expect(isTranscriptCursor(null)).toBe(false);
    expect(isTranscriptCursor('sess-1')).toBe(false);
  });
});
