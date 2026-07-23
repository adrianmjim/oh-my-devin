import type { ProgressEvent } from './progress-event';

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

export function isProgressEvent(value: unknown): value is ProgressEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record: Record<string, unknown> = value as Record<string, unknown>;
  return (
    typeof record['type'] === 'string' &&
    EVENT_TYPES.includes(record['type']) &&
    typeof record['timestamp'] === 'number'
  );
}
