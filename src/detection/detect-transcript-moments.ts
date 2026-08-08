import type { DetectedMoment } from './detected-moment';
import { detectMoments } from './detect-moments';
import type { TranscriptMessage } from './transcript-message';

export function detectTranscriptMoments(
  messages: readonly TranscriptMessage[],
): readonly DetectedMoment[] {
  return messages
    .filter(
      (message: TranscriptMessage): boolean =>
        message.role === 'user' || message.role === 'assistant',
    )
    .flatMap((message: TranscriptMessage): readonly DetectedMoment[] =>
      detectMoments(message.text),
    );
}
