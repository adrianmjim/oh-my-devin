import { describe, expect, it } from 'vitest';
import { isProgressEvent } from './is-progress-event';

const EVENT_TYPES: readonly string[] = [
  'runLaunched',
  'turnCompleted',
  'artifactValidated',
  'repairAttempted',
  'stageStarted',
  'stageCompleted',
  'gateWaitEntered',
  'gateWaitResolved',
  'terminalOutcome',
];

describe('isProgressEvent', () => {
  it('accepts each known event type carrying a numeric timestamp', () => {
    for (const type of EVENT_TYPES) {
      expect(isProgressEvent({ type, timestamp: 1 })).toBe(true);
    }
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
    expect(isProgressEvent({ type: 'runLaunched' })).toBe(false);
    expect(isProgressEvent({ type: 'runLaunched', timestamp: '1' })).toBe(
      false,
    );
  });
});
