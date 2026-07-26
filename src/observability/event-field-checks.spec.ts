import { describe, expect, it } from 'vitest';
import { EVENT_FIELD_CHECKS } from './event-field-checks';

describe('EVENT_FIELD_CHECKS', () => {
  it('checks every recorded event type', () => {
    expect(Object.keys(EVENT_FIELD_CHECKS).sort()).toEqual([
      'artifactValidated',
      'gateWaitEntered',
      'gateWaitResolved',
      'repairAttempted',
      'runLaunched',
      'stageCompleted',
      'stageStarted',
      'terminalOutcome',
      'turnCompleted',
    ]);
  });

  it('accepts a well-formed launch record', () => {
    expect(
      EVENT_FIELD_CHECKS['runLaunched']?.({
        runId: 'run-1',
        runKind: 'single-role',
        subject: 'reviewer',
        maxTurns: 6,
        artifactPath: null,
      }),
    ).toBe(true);
  });

  it('rejects a launch record carrying an unsafe run id', () => {
    expect(
      EVENT_FIELD_CHECKS['runLaunched']?.({
        runId: '../escape',
        runKind: 'single-role',
        subject: 'reviewer',
        maxTurns: 6,
        artifactPath: null,
      }),
    ).toBe(false);
  });

  it('rejects a stage record missing its index', () => {
    expect(EVENT_FIELD_CHECKS['stageStarted']?.({ stage: 'reviewer' })).toBe(
      false,
    );
  });

  it('accepts a terminal record carrying no failure tier', () => {
    expect(
      EVENT_FIELD_CHECKS['terminalOutcome']?.({
        succeeded: true,
        failureTier: null,
      }),
    ).toBe(true);
  });
});
