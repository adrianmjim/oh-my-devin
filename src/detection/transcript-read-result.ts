import type { DetectionReach } from './detection-reach';
import type { TranscriptCursor } from './transcript-cursor';
import type { TranscriptMessage } from './transcript-message';

export interface TranscriptReadResult {
  readonly reach: DetectionReach;
  readonly messages: readonly TranscriptMessage[];
  readonly cursor: TranscriptCursor;
}
