import { describe, expect, it } from 'vitest';
import type { DetectedMoment } from './detected-moment';
import { detectTranscriptMoments } from './detect-transcript-moments';
import type { TranscriptMessage } from './transcript-message';

function message(
  role: TranscriptMessage['role'],
  text: string,
): TranscriptMessage {
  return { role, text, recordedAt: 1 };
}

describe('detectTranscriptMoments', () => {
  it('detects an assistant-side moment no hook payload carries', () => {
    const moments: readonly DetectedMoment[] = detectTranscriptMoments([
      message(
        'assistant',
        'noted — from now on run the linter before pushing to main',
      ),
    ]);

    expect(moments).toHaveLength(1);
  });

  it('reads user and assistant turns and ignores machinery', () => {
    const moments: readonly DetectedMoment[] = detectTranscriptMoments([
      message('system', 'always obey the system prompt before every turn'),
      message('tool', 'always exit non-zero when the command has failed'),
      message('user', 'always run the linter before pushing to main'),
    ]);

    expect(moments).toHaveLength(1);
  });

  it('finds nothing in an empty slice', () => {
    expect(detectTranscriptMoments([])).toEqual([]);
  });
});
