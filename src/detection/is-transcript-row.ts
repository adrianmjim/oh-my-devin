import type { TranscriptRow } from './transcript-row';

export function isTranscriptRow(value: unknown): value is TranscriptRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record: Record<string, unknown> = value as Record<string, unknown>;
  return (
    typeof record['row_id'] === 'number' &&
    typeof record['chat_message'] === 'string' &&
    typeof record['created_at'] === 'number'
  );
}
