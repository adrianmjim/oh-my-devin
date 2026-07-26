import type { EventFieldCheck } from './event-field-check';
import { isFailureTierOrNull } from './is-failure-tier-or-null';
import { isGateDecision } from './is-gate-decision';
import { isRunKind } from './is-run-kind';
import { isSessionBoundary } from './is-session-boundary';
import { isStringOrNull } from './is-string-or-null';
import { isValidRunId } from './is-valid-run-id';

export const EVENT_FIELD_CHECKS: Readonly<Record<string, EventFieldCheck>> = {
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
