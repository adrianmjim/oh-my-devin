import { DatabaseSync } from 'node:sqlite';
import { isTranscriptRow } from './is-transcript-row';
import { SUPPORTED_TRANSCRIPT_SCHEMA_VERSION } from './supported-transcript-schema-version';
import { toTranscriptMessage } from './to-transcript-message';
import type { TranscriptCursor } from './transcript-cursor';
import type { TranscriptMessage } from './transcript-message';
import type { TranscriptReadResult } from './transcript-read-result';
import { TRANSCRIPT_READ_BOUND } from './transcript-read-bound';
import type { TranscriptRow } from './transcript-row';

export function readTranscriptSlice(
  storePath: string,
  cursor: TranscriptCursor,
): TranscriptReadResult {
  const degraded: TranscriptReadResult = {
    reach: 'prompt-only',
    messages: [],
    cursor,
  };
  let result: TranscriptReadResult = degraded;
  try {
    const database: DatabaseSync = new DatabaseSync(storePath, {
      readOnly: true,
    });
    try {
      const applied: unknown = database
        .prepare('SELECT MAX(version) AS version FROM refinery_schema_history')
        .get();
      const version: unknown =
        typeof applied === 'object' && applied !== null
          ? (applied as Record<string, unknown>)['version']
          : null;
      if (version === SUPPORTED_TRANSCRIPT_SCHEMA_VERSION) {
        const rows: readonly unknown[] = database
          .prepare(
            'SELECT row_id, chat_message, created_at FROM message_nodes' +
              ' WHERE session_id = ? AND row_id > ? ORDER BY row_id LIMIT ?',
          )
          .all(cursor.sessionId, cursor.lastRowId, TRANSCRIPT_READ_BOUND);
        const read: readonly TranscriptRow[] = rows.filter(isTranscriptRow);
        const messages: readonly TranscriptMessage[] = read
          .map((row: TranscriptRow): TranscriptMessage | null =>
            toTranscriptMessage(row.chat_message, row.created_at),
          )
          .filter(
            (message: TranscriptMessage | null): message is TranscriptMessage =>
              message !== null,
          );
        const lastRowId: number = read.reduce(
          (held: number, row: TranscriptRow): number =>
            row.row_id > held ? row.row_id : held,
          cursor.lastRowId,
        );
        result = {
          reach: 'both-substrates',
          messages,
          cursor: { sessionId: cursor.sessionId, lastRowId },
        };
      }
    } finally {
      database.close();
    }
  } catch {
    result = degraded;
  }
  return result;
}
