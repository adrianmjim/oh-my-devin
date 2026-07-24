import type { SessionBoundary } from './session-boundary';

export interface TurnCompletedEvent {
  readonly type: 'turnCompleted';
  readonly timestamp: number;
  readonly turnIndex: number;
  readonly boundary: SessionBoundary;
}
