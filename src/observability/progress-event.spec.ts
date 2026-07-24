import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from './progress-event';

const FORBIDDEN_CONTENT_KEYS: readonly string[] = [
  'content',
  'stdout',
  'stderr',
  'transcript',
  'conversation',
  'payload',
  'text',
  'message',
  'body',
  'output',
  'prompt',
];

const SAMPLE_EVENTS: readonly ProgressEvent[] = [
  {
    type: 'runLaunched',
    timestamp: 1000,
    runId: 'run-1',
    runKind: 'single-role',
    subject: 'reviewer',
    maxTurns: 8,
    artifactPath: 'review.json',
  },
  { type: 'turnCompleted', timestamp: 1100, turnIndex: 0, boundary: 'launch' },
  {
    type: 'artifactValidated',
    timestamp: 1200,
    artifactPath: 'review.json',
    valid: false,
    missing: false,
  },
  { type: 'repairAttempted', timestamp: 1300, turnIndex: 1 },
  { type: 'stageStarted', timestamp: 1400, stage: 'architect', stageIndex: 0 },
  {
    type: 'stageCompleted',
    timestamp: 1500,
    stage: 'architect',
    stageIndex: 0,
    valid: true,
    failureTier: null,
  },
  { type: 'gateWaitEntered', timestamp: 1600, stage: 'architect' },
  {
    type: 'gateWaitResolved',
    timestamp: 1700,
    stage: 'architect',
    decision: 'approve',
  },
  {
    type: 'terminalOutcome',
    timestamp: 1800,
    succeeded: false,
    failureTier: 'invalid_artifact',
  },
];

describe('ProgressEvent', () => {
  it('covers each event in the design vocabulary with a distinct discriminant', () => {
    const discriminants: Set<string> = new Set<string>(
      SAMPLE_EVENTS.map((event: ProgressEvent): string => event.type),
    );

    expect(discriminants).toEqual(
      new Set<string>([
        'runLaunched',
        'turnCompleted',
        'artifactValidated',
        'repairAttempted',
        'stageStarted',
        'stageCompleted',
        'gateWaitEntered',
        'gateWaitResolved',
        'terminalOutcome',
      ]),
    );
  });

  it('round-trips every event through JSON unchanged', () => {
    for (const event of SAMPLE_EVENTS) {
      const roundTripped: ProgressEvent = JSON.parse(
        JSON.stringify(event),
      ) as ProgressEvent;

      expect(roundTripped).toEqual(event);
    }
  });

  it('carries a numeric timestamp on every event', () => {
    for (const event of SAMPLE_EVENTS) {
      expect(typeof event.timestamp).toBe('number');
    }
  });

  it('exposes no free-form field that could carry conversation or engine payloads', () => {
    for (const event of SAMPLE_EVENTS) {
      for (const key of Object.keys(event)) {
        expect(FORBIDDEN_CONTENT_KEYS).not.toContain(key);
      }
    }
  });
});
