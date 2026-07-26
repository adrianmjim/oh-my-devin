import { describe, expect, it } from 'vitest';
import { outcomeDetail } from './outcome-detail';
import type { RunSnapshot } from './run-snapshot';
import type { RunState } from './run-state';

function snapshot(overrides: Partial<RunSnapshot>): RunSnapshot {
  return {
    runId: 'run-1',
    runKind: 'single-role',
    state: 'running',
    subject: 'reviewer',
    currentStage: null,
    turnsUsed: 0,
    maxTurns: 6,
    artifactPath: null,
    artifactValid: null,
    pendingGate: null,
    failureTier: null,
    lastEventAt: 0,
    ...overrides,
  };
}

describe('outcomeDetail', () => {
  it('reports success', () => {
    expect(outcomeDetail(snapshot({ state: 'succeeded' }))).toBe('success');
  });

  it('names the failure tier of a failed run', () => {
    expect(
      outcomeDetail(snapshot({ state: 'failed', failureTier: 'deny' })),
    ).toBe('failure (deny)');
  });

  it('reports an unknown tier when a failed run carries none', () => {
    expect(outcomeDetail(snapshot({ state: 'failed' }))).toBe(
      'failure (unknown)',
    );
  });

  it('reports progress while the run is running', () => {
    expect(outcomeDetail(snapshot({}))).toBe('in progress');
  });

  it('explains a stall by its missing liveness', () => {
    expect(outcomeDetail(snapshot({ state: 'stalled' }))).toBe(
      'stalled — no recent liveness',
    );
  });

  it('names the stage a run awaits its gate at', () => {
    expect(
      outcomeDetail(
        snapshot({ state: 'awaiting-gate', pendingGate: 'reviewer' }),
      ),
    ).toBe('awaiting gate at reviewer');
  });

  it('reports an unknown gate when the state carries none', () => {
    const state: RunState = 'awaiting-gate';

    expect(outcomeDetail(snapshot({ state }))).toBe(
      'awaiting gate at (unknown)',
    );
  });
});
