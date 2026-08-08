import { describe, expect, it } from 'vitest';
import { toTranscriptMessage } from './to-transcript-message';
import type { TranscriptMessage } from './transcript-message';

describe('toTranscriptMessage', () => {
  it('translates an engine message into omd’s own shape', () => {
    const message: TranscriptMessage | null = toTranscriptMessage(
      JSON.stringify({
        role: 'assistant',
        content: 'the staging gate is manual',
        message_id: 'abc',
      }),
      1700,
    );

    expect(message).toEqual({
      role: 'assistant',
      text: 'the staging gate is manual',
      recordedAt: 1700,
    });
  });

  it('rejects a message whose role is outside the vocabulary', () => {
    expect(
      toTranscriptMessage(
        JSON.stringify({ role: 'narrator', content: 'text' }),
        1,
      ),
    ).toBeNull();
  });

  it('rejects a message carrying no textual content', () => {
    expect(
      toTranscriptMessage(JSON.stringify({ role: 'user', content: [] }), 1),
    ).toBeNull();
  });

  it('rejects content the engine no longer stores as JSON', () => {
    expect(toTranscriptMessage('not json at all', 1)).toBeNull();
  });
});
