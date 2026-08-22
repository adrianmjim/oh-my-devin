import { describe, expect, it } from 'vitest';
import { isTranscriptRow } from './is-transcript-row';

describe('isTranscriptRow', () => {
  it('recognizes the row shape the reader selects', () => {
    expect(
      isTranscriptRow({ row_id: 4, chat_message: '{}', created_at: 10 }),
    ).toBe(true);
  });

  it('rejects a row whose columns drifted away', () => {
    expect(isTranscriptRow({ row_id: 4, created_at: 10 })).toBe(false);
    expect(
      isTranscriptRow({ row_id: '4', chat_message: '{}', created_at: 10 }),
    ).toBe(false);
    expect(isTranscriptRow(null)).toBe(false);
  });
});
