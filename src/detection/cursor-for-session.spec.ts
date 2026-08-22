import { describe, expect, it } from 'vitest';
import { cursorForSession } from './cursor-for-session';
import type { TranscriptCursor } from './transcript-cursor';

const HELD: readonly TranscriptCursor[] = [
  { sessionId: 'sess-1', lastRowId: 12 },
  { sessionId: 'sess-2', lastRowId: 3 },
];

describe('cursorForSession', () => {
  it('picks the cursor the session recorded', () => {
    expect(cursorForSession(HELD, 'sess-2')).toEqual({
      sessionId: 'sess-2',
      lastRowId: 3,
    });
  });

  it('starts a session that recorded none at the beginning', () => {
    expect(cursorForSession(HELD, 'sess-9')).toEqual({
      sessionId: 'sess-9',
      lastRowId: 0,
    });
  });

  it('starts at the beginning when nothing was recorded at all', () => {
    expect(cursorForSession([], 'sess-1')).toEqual({
      sessionId: 'sess-1',
      lastRowId: 0,
    });
  });
});
