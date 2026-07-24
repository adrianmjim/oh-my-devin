import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from './progress-event';
import { deriveSnapshot } from './derive-snapshot';
import type { RunSnapshot } from './run-snapshot';

const THRESHOLD: number = 120000;
const FRESH_NOW: number = 10000;

function singleRoleLaunched(): ProgressEvent {
  return {
    type: 'runLaunched',
    timestamp: 1000,
    runId: 'run-1',
    runKind: 'single-role',
    subject: 'reviewer',
    maxTurns: 8,
    artifactPath: 'review.json',
  };
}

function pipelineLaunched(): ProgressEvent {
  return {
    type: 'runLaunched',
    timestamp: 1000,
    runId: 'run-2',
    runKind: 'pipeline',
    subject: 'feature-team',
    maxTurns: 0,
    artifactPath: null,
  };
}

describe('deriveSnapshot', () => {
  it('derives identity, kind, turns, artifact and running state for a live single-role run', () => {
    const events: readonly ProgressEvent[] = [
      singleRoleLaunched(),
      {
        type: 'turnCompleted',
        timestamp: 2000,
        turnIndex: 0,
        boundary: 'launch',
      },
      {
        type: 'artifactValidated',
        timestamp: 2100,
        artifactPath: 'review.json',
        valid: true,
        missing: false,
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      9000,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.runId).toBe('run-1');
    expect(snapshot.runKind).toBe('single-role');
    expect(snapshot.subject).toBe('reviewer');
    expect(snapshot.currentStage).toBeNull();
    expect(snapshot.state).toBe('running');
    expect(snapshot.turnsUsed).toBe(1);
    expect(snapshot.maxTurns).toBe(8);
    expect(snapshot.artifactPath).toBe('review.json');
    expect(snapshot.artifactValid).toBe(true);
    expect(snapshot.failureTier).toBeNull();
    expect(snapshot.lastEventAt).toBe(2100);
  });

  it('reads stalled when there is no terminal outcome and the stamp is old', () => {
    const events: readonly ProgressEvent[] = [singleRoleLaunched()];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      1000,
      1000 + THRESHOLD + 1,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('stalled');
  });

  it('reads stalled when no liveness stamp exists yet', () => {
    const events: readonly ProgressEvent[] = [singleRoleLaunched()];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      null,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('stalled');
  });

  it('reports succeeded with a null tier for a terminated successful run', () => {
    const events: readonly ProgressEvent[] = [
      singleRoleLaunched(),
      {
        type: 'turnCompleted',
        timestamp: 2000,
        turnIndex: 0,
        boundary: 'launch',
      },
      {
        type: 'terminalOutcome',
        timestamp: 3000,
        succeeded: true,
        failureTier: null,
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2000,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('succeeded');
    expect(snapshot.failureTier).toBeNull();
  });

  it('reports failed with the run-failure-semantics tier for a failed run', () => {
    const events: readonly ProgressEvent[] = [
      singleRoleLaunched(),
      {
        type: 'terminalOutcome',
        timestamp: 3000,
        succeeded: false,
        failureTier: 'invalid_artifact',
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2000,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('failed');
    expect(snapshot.failureTier).toBe('invalid_artifact');
  });

  it('reports the current stage of a live pipeline run', () => {
    const events: readonly ProgressEvent[] = [
      pipelineLaunched(),
      {
        type: 'stageStarted',
        timestamp: 2000,
        stage: 'executor',
        stageIndex: 1,
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      1900,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.runKind).toBe('pipeline');
    expect(snapshot.subject).toBe('feature-team');
    expect(snapshot.currentStage).toBe('executor');
    expect(snapshot.state).toBe('running');
  });

  it('surfaces the awaited gate and names its boundary', () => {
    const events: readonly ProgressEvent[] = [
      pipelineLaunched(),
      {
        type: 'stageStarted',
        timestamp: 2000,
        stage: 'architect',
        stageIndex: 0,
      },
      {
        type: 'stageCompleted',
        timestamp: 2100,
        stage: 'architect',
        stageIndex: 0,
        valid: true,
        failureTier: null,
      },
      { type: 'gateWaitEntered', timestamp: 2200, stage: 'architect' },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2100,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('awaiting-gate');
    expect(snapshot.pendingGate).toBe('architect');
    expect(snapshot.currentStage).toBe('architect');
  });

  it('reads stalled, not awaiting-gate, for a run that died while parked at a gate', () => {
    const events: readonly ProgressEvent[] = [
      pipelineLaunched(),
      {
        type: 'stageStarted',
        timestamp: 2000,
        stage: 'architect',
        stageIndex: 0,
      },
      { type: 'gateWaitEntered', timestamp: 2200, stage: 'architect' },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2200,
      2200 + THRESHOLD + 1,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('stalled');
    expect(snapshot.pendingGate).toBe('architect');
  });

  it('clears the pending gate once it resolves', () => {
    const events: readonly ProgressEvent[] = [
      pipelineLaunched(),
      {
        type: 'stageStarted',
        timestamp: 2000,
        stage: 'architect',
        stageIndex: 0,
      },
      { type: 'gateWaitEntered', timestamp: 2200, stage: 'architect' },
      {
        type: 'gateWaitResolved',
        timestamp: 2300,
        stage: 'architect',
        decision: 'approve',
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2250,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.pendingGate).toBeNull();
    expect(snapshot.state).toBe('running');
  });

  it('keeps snapshot size independent of the number of turns consumed', () => {
    const manyTurns: ProgressEvent[] = [singleRoleLaunched()];
    for (let index: number = 0; index < 200; index += 1) {
      manyTurns.push({
        type: 'turnCompleted',
        timestamp: 2000 + index,
        turnIndex: index,
        boundary: index === 0 ? 'launch' : 'resume',
      });
    }

    const snapshot: RunSnapshot = deriveSnapshot(
      manyTurns,
      2100,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(snapshot.turnsUsed).toBe(200);
    for (const value of Object.values(snapshot)) {
      expect(Array.isArray(value)).toBe(false);
      expect(typeof value === 'object' && value !== null).toBe(false);
    }
  });

  it('stays running through a long turn when the stamp is fresh though the last event is old', () => {
    const events: readonly ProgressEvent[] = [
      singleRoleLaunched(),
      {
        type: 'turnCompleted',
        timestamp: 2000,
        turnIndex: 0,
        boundary: 'launch',
      },
    ];
    const stampedAt: number = 2000 + 10 * THRESHOLD;
    const now: number = stampedAt + THRESHOLD - 1;

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      stampedAt,
      now,
      THRESHOLD,
    );

    expect(snapshot.state).toBe('running');
    expect(snapshot.lastEventAt).toBe(2000);
  });

  it('renders only the bounded, transcript-free field set', () => {
    const events: readonly ProgressEvent[] = [
      singleRoleLaunched(),
      {
        type: 'turnCompleted',
        timestamp: 2000,
        turnIndex: 0,
        boundary: 'launch',
      },
      {
        type: 'artifactValidated',
        timestamp: 2100,
        artifactPath: 'review.json',
        valid: true,
        missing: false,
      },
    ];

    const snapshot: RunSnapshot = deriveSnapshot(
      events,
      2050,
      FRESH_NOW,
      THRESHOLD,
    );

    expect(Object.keys(snapshot).sort()).toEqual(
      [
        'artifactPath',
        'artifactValid',
        'currentStage',
        'failureTier',
        'lastEventAt',
        'maxTurns',
        'pendingGate',
        'runId',
        'runKind',
        'state',
        'subject',
        'turnsUsed',
      ].sort(),
    );
  });
});
