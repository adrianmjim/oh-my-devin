import { describe, expect, it } from 'vitest';
import { advanceCursor } from './advance-cursor';
import type { TranscriptCursor } from './transcript-cursor';

const HELD: readonly TranscriptCursor[] = [
  { sessionId: 'sess-1', lastRowId: 12 },
  { sessionId: 'sess-2', lastRowId: 3 },
];

describe('advanceCursor', () => {
  it('replaces the cursor the session already held', () => {
    expect(advanceCursor(HELD, { sessionId: 'sess-1', lastRowId: 20 })).toEqual(
      [
        { sessionId: 'sess-1', lastRowId: 20 },
        { sessionId: 'sess-2', lastRowId: 3 },
      ],
    );
  });

  it('records a cursor for a session holding none', () => {
    expect(advanceCursor([], { sessionId: 'sess-9', lastRowId: 4 })).toEqual([
      { sessionId: 'sess-9', lastRowId: 4 },
    ]);
  });

  it('leaves every other session untouched', () => {
    expect(
      advanceCursor(HELD, { sessionId: 'sess-9', lastRowId: 4 }),
    ).toHaveLength(3);
  });
});
