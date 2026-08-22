import type { TranscriptRole } from './transcript-role';

export interface TranscriptMessage {
  readonly role: TranscriptRole;
  readonly text: string;
  readonly recordedAt: number;
}
