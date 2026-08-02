import { describe, expect, it } from 'vitest';
import { initialSnapshotAccumulator } from './initial-snapshot-accumulator';

describe('initialSnapshotAccumulator', () => {
  it('starts from an empty single-role run', () => {
    const accumulator = initialSnapshotAccumulator();

    expect(accumulator.runId).toBe('');
    expect(accumulator.runKind).toBe('single-role');
    expect(accumulator.turnsUsed).toBe(0);
    expect(accumulator.maxTurns).toBe(0);
    expect(accumulator.lastEventAt).toBe(0);
    expect(accumulator.stateEnteredAt).toBe(0);
  });

  it('leaves every derived field unknown', () => {
    const accumulator = initialSnapshotAccumulator();

    expect(accumulator.currentStage).toBeNull();
    expect(accumulator.artifactPath).toBeNull();
    expect(accumulator.artifactValid).toBeNull();
    expect(accumulator.pendingGate).toBeNull();
    expect(accumulator.succeeded).toBeNull();
    expect(accumulator.failureTier).toBeNull();
  });

  it('gives each call its own accumulator', () => {
    expect(initialSnapshotAccumulator()).not.toBe(initialSnapshotAccumulator());
  });
});
