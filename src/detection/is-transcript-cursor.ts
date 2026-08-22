import type { TranscriptCursor } from './transcript-cursor';

export function isTranscriptCursor(value: unknown): value is TranscriptCursor {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<TranscriptCursor> = value;
  return (
    typeof candidate.sessionId === 'string' &&
    typeof candidate.lastRowId === 'number'
  );
}
