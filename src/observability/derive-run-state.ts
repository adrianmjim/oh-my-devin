import { deriveLiveness } from './derive-liveness';
import { eventStateOf } from './event-state-of';
import type { Liveness } from './liveness';
import type { RunState } from './run-state';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function deriveRunState(
  accumulator: SnapshotAccumulator,
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): RunState {
  let state: RunState = eventStateOf(accumulator);
  if (state !== 'succeeded' && state !== 'failed') {
    const liveness: Liveness = deriveLiveness(stampedAt, now, thresholdMs);
    if (liveness === 'stalled') {
      state = 'stalled';
    }
  }
  return state;
}
