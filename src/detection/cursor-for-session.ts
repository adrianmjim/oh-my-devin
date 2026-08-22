import type { TranscriptCursor } from './transcript-cursor';

export function cursorForSession(
  cursors: readonly TranscriptCursor[],
  sessionId: string,
): TranscriptCursor {
  const held: TranscriptCursor | undefined = cursors.find(
    (cursor: TranscriptCursor): boolean => cursor.sessionId === sessionId,
  );
  return held ?? { sessionId, lastRowId: 0 };
}
