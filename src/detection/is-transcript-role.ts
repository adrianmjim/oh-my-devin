import type { TranscriptRole } from './transcript-role';

export function isTranscriptRole(value: unknown): value is TranscriptRole {
  return (
    value === 'system' ||
    value === 'user' ||
    value === 'assistant' ||
    value === 'tool'
  );
}
