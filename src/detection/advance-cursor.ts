import type { TranscriptCursor } from './transcript-cursor';

export function advanceCursor(
  cursors: readonly TranscriptCursor[],
  advanced: TranscriptCursor,
): readonly TranscriptCursor[] {
  const others: readonly TranscriptCursor[] = cursors.filter(
    (cursor: TranscriptCursor): boolean =>
      cursor.sessionId !== advanced.sessionId,
  );
  return [advanced, ...others];
}
