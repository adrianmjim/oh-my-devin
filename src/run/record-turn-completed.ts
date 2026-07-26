import type { RunObserver } from '../observability/run-observer';
import type { SessionBoundary } from '../observability/session-boundary';

export async function recordTurnCompleted(
  recorder: RunObserver | undefined,
  timestamp: number,
  turnIndex: number,
): Promise<void> {
  const boundary: SessionBoundary = turnIndex === 0 ? 'launch' : 'resume';
  await recorder?.append({
    type: 'turnCompleted',
    timestamp,
    turnIndex,
    boundary,
  });
}
