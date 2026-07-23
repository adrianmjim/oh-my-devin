import type { ProgressEvent } from './progress-event';

export interface RunObserver {
  append(event: ProgressEvent): Promise<void>;
  close(): void;
}
