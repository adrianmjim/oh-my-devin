import { describe, expect, it } from 'vitest';
import { deriveRunState } from './derive-run-state';
import { initialSnapshotAccumulator } from './initial-snapshot-accumulator';
import type { SnapshotAccumulator } from './snapshot-accumulator';

function accumulator(
  overrides: Partial<SnapshotAccumulator>,
): SnapshotAccumulator {
  return Object.assign(initialSnapshotAccumulator(), overrides);
}

describe('deriveRunState', () => {
  it('is succeeded or failed once the run reached its outcome', () => {
    expect(deriveRunState(accumulator({ succeeded: true }), 0, 0, 100)).toBe(
      'succeeded',
    );
    expect(deriveRunState(accumulator({ succeeded: false }), 0, 0, 100)).toBe(
      'failed',
    );
  });

  it('is stalled when liveness lapsed, whatever else is pending', () => {
    expect(
      deriveRunState(accumulator({ pendingGate: 'reviewer' }), 0, 1000, 100),
    ).toBe('stalled');
  });

  it('awaits the gate of a live run holding one', () => {
    expect(
      deriveRunState(accumulator({ pendingGate: 'reviewer' }), 0, 10, 100),
    ).toBe('awaiting-gate');
  });

  it('is running otherwise', () => {
    expect(deriveRunState(accumulator({}), 0, 10, 100)).toBe('running');
  });
});
