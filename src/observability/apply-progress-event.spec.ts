import { describe, expect, it } from 'vitest';
import { applyProgressEvent } from './apply-progress-event';
import { initialSnapshotAccumulator } from './initial-snapshot-accumulator';
import type { SnapshotAccumulator } from './snapshot-accumulator';

describe('applyProgressEvent', () => {
  it('stamps the accumulator with the event time', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'repairAttempted',
      timestamp: 42,
      turnIndex: 0,
    });

    expect(accumulator.lastEventAt).toBe(42);
  });

  it('takes the run identity from the launch event', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'runLaunched',
      timestamp: 1,
      runId: 'run-1',
      runKind: 'pipeline',
      subject: 'default',
      maxTurns: 6,
      artifactPath: 'review.json',
    });

    expect(accumulator.runId).toBe('run-1');
    expect(accumulator.runKind).toBe('pipeline');
    expect(accumulator.subject).toBe('default');
    expect(accumulator.maxTurns).toBe(6);
    expect(accumulator.artifactPath).toBe('review.json');
  });

  it('counts a completed turn from its zero-based index', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'turnCompleted',
      timestamp: 1,
      turnIndex: 2,
      boundary: 'resume',
    });

    expect(accumulator.turnsUsed).toBe(3);
  });

  it('records the validation verdict of the artifact', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'artifactValidated',
      timestamp: 1,
      artifactPath: 'review.json',
      valid: false,
      missing: false,
    });

    expect(accumulator.artifactValid).toBe(false);
  });

  it('enters a stage and clears any pending gate', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();
    accumulator.pendingGate = 'architect';

    applyProgressEvent(accumulator, {
      type: 'stageStarted',
      timestamp: 1,
      stage: 'executor',
      stageIndex: 1,
    });

    expect(accumulator.currentStage).toBe('executor');
    expect(accumulator.pendingGate).toBeNull();
  });

  it('tracks the gate a run waits at and its resolution', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'gateWaitEntered',
      timestamp: 1,
      stage: 'reviewer',
    });
    expect(accumulator.pendingGate).toBe('reviewer');

    applyProgressEvent(accumulator, {
      type: 'gateWaitResolved',
      timestamp: 2,
      stage: 'reviewer',
      decision: 'approve',
    });
    expect(accumulator.pendingGate).toBeNull();
  });

  it('records the terminal outcome', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'terminalOutcome',
      timestamp: 1,
      succeeded: false,
      failureTier: 'budget',
    });

    expect(accumulator.succeeded).toBe(false);
    expect(accumulator.failureTier).toBe('budget');
  });

  it('dates the entered state from the first event', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'runLaunched',
      timestamp: 1000,
      runId: 'run-1',
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: null,
    });

    expect(accumulator.stateEnteredAt).toBe(1000);
  });

  it('keeps the entered-state date through progress within the same state', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'runLaunched',
      timestamp: 1000,
      runId: 'run-1',
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: null,
    });
    applyProgressEvent(accumulator, {
      type: 'turnCompleted',
      timestamp: 2000,
      turnIndex: 0,
      boundary: 'launch',
    });

    expect(accumulator.stateEnteredAt).toBe(1000);
  });

  it('re-dates the state when a gate wait begins and when it resolves', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'gateWaitEntered',
      timestamp: 2000,
      stage: 'architect',
    });
    expect(accumulator.stateEnteredAt).toBe(2000);

    applyProgressEvent(accumulator, {
      type: 'gateWaitResolved',
      timestamp: 3000,
      stage: 'architect',
      decision: 'approve',
    });
    expect(accumulator.stateEnteredAt).toBe(3000);
  });

  it('re-dates the state when a stage start clears a pending gate', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'gateWaitEntered',
      timestamp: 2000,
      stage: 'architect',
    });
    applyProgressEvent(accumulator, {
      type: 'stageStarted',
      timestamp: 3000,
      stage: 'executor',
      stageIndex: 1,
    });

    expect(accumulator.stateEnteredAt).toBe(3000);
  });

  it('re-dates the state at the terminal outcome', () => {
    const accumulator: SnapshotAccumulator = initialSnapshotAccumulator();

    applyProgressEvent(accumulator, {
      type: 'runLaunched',
      timestamp: 1000,
      runId: 'run-1',
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: null,
    });
    applyProgressEvent(accumulator, {
      type: 'terminalOutcome',
      timestamp: 5000,
      succeeded: true,
      failureTier: null,
    });

    expect(accumulator.stateEnteredAt).toBe(5000);
  });
});
