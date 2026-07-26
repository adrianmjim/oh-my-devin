import { deriveLiveness } from './derive-liveness';
import type { Liveness } from './liveness';
import type { RunState } from './run-state';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function deriveRunState(
  accumulator: SnapshotAccumulator,
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): RunState {
  if (accumulator.succeeded !== null) {
    return accumulator.succeeded ? 'succeeded' : 'failed';
  }
  const liveness: Liveness = deriveLiveness(stampedAt, now, thresholdMs);
  if (liveness === 'stalled') {
    return 'stalled';
  }
  if (accumulator.pendingGate !== null) {
    return 'awaiting-gate';
  }
  return 'running';
}
