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
  stateEnteredAt: 2100,
};

const JSON_VIEW: JsonRunSnapshot = {
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
  it('maps the single-run field set into the machine-readable view unchanged', () => {
    const json: JsonRunSnapshot = renderSnapshotJson(SNAPSHOT);

    expect(json).toEqual(JSON_VIEW);
  });

  it('produces camelCase keys that survive a JSON round-trip', () => {
    const json: JsonRunSnapshot = renderSnapshotJson(SNAPSHOT);
    const roundTripped: JsonRunSnapshot = JSON.parse(
      JSON.stringify(json),
    ) as JsonRunSnapshot;

    expect(roundTripped).toEqual(JSON_VIEW);
    expect(Object.keys(json)).toContain('runId');
    expect(Object.keys(json)).toContain('pendingGate');
  });
});
