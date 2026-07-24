import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from './progress-event';
import { isProgressEvent } from './is-progress-event';

const COMPLETE_EVENTS: readonly ProgressEvent[] = [
  {
    type: 'runLaunched',
    timestamp: 1,
    runId: 'run-1',
    runKind: 'single-role',
    subject: 'reviewer',
    maxTurns: 8,
    artifactPath: 'review.json',
  },
  { type: 'turnCompleted', timestamp: 1, turnIndex: 0, boundary: 'launch' },
  {
    type: 'artifactValidated',
    timestamp: 1,
    artifactPath: 'review.json',
    valid: true,
    missing: false,
  },
  { type: 'repairAttempted', timestamp: 1, turnIndex: 1 },
  { type: 'stageStarted', timestamp: 1, stage: 'architect', stageIndex: 0 },
  {
    type: 'stageCompleted',
    timestamp: 1,
    stage: 'architect',
    stageIndex: 0,
    valid: false,
    failureTier: 'invalid_artifact',
  },
  { type: 'gateWaitEntered', timestamp: 1, stage: 'architect' },
  {
    type: 'gateWaitResolved',
    timestamp: 1,
    stage: 'architect',
    decision: 'approve',
  },
  { type: 'terminalOutcome', timestamp: 1, succeeded: true, failureTier: null },
];

describe('isProgressEvent', () => {
  it('accepts every complete event of the vocabulary', () => {
    for (const event of COMPLETE_EVENTS) {
      expect(isProgressEvent(event)).toBe(true);
    }
  });

  it('accepts a runLaunched event with a null artifact path', () => {
    expect(
      isProgressEvent({
        type: 'runLaunched',
        timestamp: 1,
        runId: 'run-2',
        runKind: 'pipeline',
        subject: 'feature-team',
        maxTurns: 0,
        artifactPath: null,
      }),
    ).toBe(true);
  });

  it('rejects values that are not objects', () => {
    expect(isProgressEvent(null)).toBe(false);
    expect(isProgressEvent('runLaunched')).toBe(false);
    expect(isProgressEvent(42)).toBe(false);
  });

  it('rejects an unknown event type', () => {
    expect(isProgressEvent({ type: 'sessionResumed', timestamp: 1 })).toBe(
      false,
    );
  });

  it('rejects an event whose timestamp is missing or non-numeric', () => {
    expect(isProgressEvent({ type: 'gateWaitEntered', stage: 's' })).toBe(
      false,
    );
    expect(
      isProgressEvent({ type: 'gateWaitEntered', stage: 's', timestamp: '1' }),
    ).toBe(false);
  });

  it('rejects a known event type missing its required fields', () => {
    expect(isProgressEvent({ type: 'runLaunched', timestamp: 1 })).toBe(false);
    expect(isProgressEvent({ type: 'turnCompleted', timestamp: 1 })).toBe(
      false,
    );
    expect(isProgressEvent({ type: 'terminalOutcome', timestamp: 1 })).toBe(
      false,
    );
  });

  it('rejects a runLaunched event whose run id is not a safe path segment', () => {
    expect(
      isProgressEvent({
        type: 'runLaunched',
        timestamp: 1,
        runId: '../escape',
        runKind: 'single-role',
        subject: 'reviewer',
        maxTurns: 8,
        artifactPath: null,
      }),
    ).toBe(false);
  });

  it('rejects an event whose fields carry the wrong types', () => {
    expect(
      isProgressEvent({
        type: 'runLaunched',
        timestamp: 1,
        runId: 42,
        runKind: 'single-role',
        subject: 'reviewer',
        maxTurns: 8,
        artifactPath: null,
      }),
    ).toBe(false);
    expect(
      isProgressEvent({
        type: 'turnCompleted',
        timestamp: 1,
        turnIndex: 0,
        boundary: 'reboot',
      }),
    ).toBe(false);
    expect(
      isProgressEvent({
        type: 'terminalOutcome',
        timestamp: 1,
        succeeded: false,
        failureTier: 'catastrophic',
      }),
    ).toBe(false);
  });
});
