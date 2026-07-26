import { describe, expect, it } from 'vitest';
import { launchingSnapshot } from './launching-snapshot';
import type { RunSnapshot } from './run-snapshot';

describe('launchingSnapshot', () => {
  it('reports a run whose record exists but whose journal is empty', () => {
    const snapshot: RunSnapshot = launchingSnapshot('run-1', 100, 110, 1000);

    expect(snapshot.runId).toBe('run-1');
    expect(snapshot.state).toBe('running');
    expect(snapshot.turnsUsed).toBe(0);
    expect(snapshot.lastEventAt).toBe(100);
  });

  it('reads as stalled once the record ages past the threshold', () => {
    expect(launchingSnapshot('run-1', 0, 5000, 1000).state).toBe('stalled');
  });

  it('carries no stage, artifact, gate, or failure yet', () => {
    const snapshot: RunSnapshot = launchingSnapshot('run-1', 100, 110, 1000);

    expect(snapshot.currentStage).toBeNull();
    expect(snapshot.artifactPath).toBeNull();
    expect(snapshot.artifactValid).toBeNull();
    expect(snapshot.pendingGate).toBeNull();
    expect(snapshot.failureTier).toBeNull();
  });
});
