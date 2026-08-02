import { describe, expect, it } from 'vitest';
import { eventStateOf } from './event-state-of';
import { initialSnapshotAccumulator } from './initial-snapshot-accumulator';
import type { SnapshotAccumulator } from './snapshot-accumulator';

describe('eventStateOf', () => {
  it('reads running for an accumulator with no gate and no outcome', () => {
    expect(eventStateOf(initialSnapshotAccumulator())).toBe('running');
  });

  it('reads awaiting-gate while a gate is pending', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();
    accumulator.pendingGate = 'architect';

    expect(eventStateOf(accumulator)).toBe('awaiting-gate');
  });

  it('reads the terminal outcome over a pending gate', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();
    accumulator.pendingGate = 'architect';
    accumulator.succeeded = true;

    expect(eventStateOf(accumulator)).toBe('succeeded');
  });

  it('reads failed for an unsuccessful outcome', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();
    accumulator.succeeded = false;

    expect(eventStateOf(accumulator)).toBe('failed');
  });
});
