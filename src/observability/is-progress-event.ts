import { isValidRunId } from './is-valid-run-id';
import type { ProgressEvent } from './progress-event';

type EventFieldCheck = (record: Record<string, unknown>) => boolean;

function isRunKind(value: unknown): boolean {
  return value === 'single-role' || value === 'pipeline';
}

function isSessionBoundary(value: unknown): boolean {
  return value === 'launch' || value === 'resume';
}

function isGateDecision(value: unknown): boolean {
  return value === 'approve' || value === 'reject' || value === 'none';
}

function isFailureTierOrNull(value: unknown): boolean {
  return (
    value === null ||
    value === 'deny' ||
    value === 'invalid_artifact' ||
    value === 'budget'
  );
}

function isStringOrNull(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

const EVENT_FIELD_CHECKS: Readonly<Record<string, EventFieldCheck>> = {
  runLaunched: (record: Record<string, unknown>): boolean =>
    typeof record['runId'] === 'string' &&
    isValidRunId(record['runId']) &&
    isRunKind(record['runKind']) &&
    typeof record['subject'] === 'string' &&
    typeof record['maxTurns'] === 'number' &&
    isStringOrNull(record['artifactPath']),
  turnCompleted: (record: Record<string, unknown>): boolean =>
    typeof record['turnIndex'] === 'number' &&
    isSessionBoundary(record['boundary']),
  artifactValidated: (record: Record<string, unknown>): boolean =>
    typeof record['artifactPath'] === 'string' &&
    typeof record['valid'] === 'boolean' &&
    typeof record['missing'] === 'boolean',
  repairAttempted: (record: Record<string, unknown>): boolean =>
    typeof record['turnIndex'] === 'number',
  stageStarted: (record: Record<string, unknown>): boolean =>
    typeof record['stage'] === 'string' &&
    typeof record['stageIndex'] === 'number',
  stageCompleted: (record: Record<string, unknown>): boolean =>
    typeof record['stage'] === 'string' &&
    typeof record['stageIndex'] === 'number' &&
    typeof record['valid'] === 'boolean' &&
    isFailureTierOrNull(record['failureTier']),
  gateWaitEntered: (record: Record<string, unknown>): boolean =>
    typeof record['stage'] === 'string',
  gateWaitResolved: (record: Record<string, unknown>): boolean =>
    typeof record['stage'] === 'string' && isGateDecision(record['decision']),
  terminalOutcome: (record: Record<string, unknown>): boolean =>
    typeof record['succeeded'] === 'boolean' &&
    isFailureTierOrNull(record['failureTier']),
};

export function isProgressEvent(value: unknown): value is ProgressEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record: Record<string, unknown> = value as Record<string, unknown>;
  if (typeof record['timestamp'] !== 'number') {
    return false;
  }
  const type: unknown = record['type'];
  const check: EventFieldCheck | undefined =
    typeof type === 'string' ? EVENT_FIELD_CHECKS[type] : undefined;
  return check?.(record) ?? false;
}
