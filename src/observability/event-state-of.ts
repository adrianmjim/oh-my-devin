import type { RunState } from './run-state';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function eventStateOf(accumulator: SnapshotAccumulator): RunState {
  let state: RunState = 'running';
  if (accumulator.succeeded !== null) {
    state = accumulator.succeeded ? 'succeeded' : 'failed';
  } else if (accumulator.pendingGate !== null) {
    state = 'awaiting-gate';
  }
  return state;
}
