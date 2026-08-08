import { isTranscriptRole } from './is-transcript-role';
import type { TranscriptMessage } from './transcript-message';

export function toTranscriptMessage(
  chatMessage: string,
  recordedAt: number,
): TranscriptMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(chatMessage);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const record: Record<string, unknown> = parsed as Record<string, unknown>;
  const role: unknown = record['role'];
  const content: unknown = record['content'];
  return isTranscriptRole(role) && typeof content === 'string' && content !== ''
    ? { role, text: content, recordedAt }
    : null;
}
