import { describe, expect, it } from 'vitest';
import { renderSnapshotHuman } from './render-snapshot-human';
import type { RunSnapshot } from './run-snapshot';

function snapshot(overrides: Partial<RunSnapshot> = {}): RunSnapshot {
  return {
    runId: 'run-1',
    runKind: 'single-role',
    state: 'running',
    subject: 'reviewer',
    currentStage: null,
    turnsUsed: 2,
    maxTurns: 8,
    artifactPath: 'review.json',
    artifactValid: true,
    pendingGate: null,
    failureTier: null,
    lastEventAt: 4242,
    ...overrides,
  };
}

describe('renderSnapshotHuman', () => {
  it('renders a headed block carrying identity, state and progress', () => {
    const text: string = renderSnapshotHuman(snapshot());

    expect(text).toContain('omd status — running');
    expect(text).toContain('run:      run-1');
    expect(text).toContain('kind:     single-role');
    expect(text).toContain('role:     reviewer');
    expect(text).toContain('turns:    2/8');
    expect(text).toContain('review.json (valid)');
    expect(text).toContain('updated:  4242');
  });

  it('names the awaited gate when the run is awaiting a decision', () => {
    const text: string = renderSnapshotHuman(
      snapshot({
        runKind: 'pipeline',
        subject: 'feature-team',
        state: 'awaiting-gate',
        currentStage: 'architect',
        pendingGate: 'architect',
        artifactPath: null,
        artifactValid: null,
      }),
    );

    expect(text).toContain('omd status — awaiting-gate');
    expect(text).toContain('team:     feature-team');
    expect(text).toContain('awaiting gate at architect');
  });

  it('reports the failure tier for a failed run', () => {
    const text: string = renderSnapshotHuman(
      snapshot({
        state: 'failed',
        failureTier: 'invalid_artifact',
        artifactValid: false,
      }),
    );

    expect(text).toContain('omd status — failed');
    expect(text).toContain('failure (invalid_artifact)');
  });

  it('marks a stalled run distinctly from a running one', () => {
    const text: string = renderSnapshotHuman(snapshot({ state: 'stalled' }));

    expect(text).toContain('omd status — stalled');
    expect(text).toContain('no recent liveness');
  });
});
