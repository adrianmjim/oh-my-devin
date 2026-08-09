import type { ProgressEvent } from './progress-event';
import type { RunClaim } from './run-claim';

export interface RunObserver {
  append(event: ProgressEvent): Promise<void>;
  claim(claim: RunClaim): Promise<void>;
  close(): void;
}
