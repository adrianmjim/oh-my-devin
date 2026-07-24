import { describe, expect, it } from 'vitest';
import type { JsonRunSnapshot } from './json-run-snapshot';
import { renderSnapshotJson } from './render-snapshot-json';
import type { RunSnapshot } from './run-snapshot';

const SNAPSHOT: RunSnapshot = {
  runId: 'run-1',
  runKind: 'pipeline',
  state: 'awaiting-gate',
  subject: 'feature-team',
  currentStage: 'architect',
  turnsUsed: 0,
  maxTurns: 0,
  artifactPath: null,
  artifactValid: null,
  pendingGate: 'architect',
  failureTier: null,
  lastEventAt: 2200,
};

describe('renderSnapshotJson', () => {
  it('maps every snapshot field into the machine-readable view unchanged', () => {
    const json: JsonRunSnapshot = renderSnapshotJson(SNAPSHOT);

    expect(json).toEqual(SNAPSHOT);
  });

  it('produces camelCase keys that survive a JSON round-trip', () => {
    const json: JsonRunSnapshot = renderSnapshotJson(SNAPSHOT);
    const roundTripped: JsonRunSnapshot = JSON.parse(
      JSON.stringify(json),
    ) as JsonRunSnapshot;

    expect(roundTripped).toEqual(SNAPSHOT);
    expect(Object.keys(json)).toContain('runId');
    expect(Object.keys(json)).toContain('pendingGate');
  });
});
