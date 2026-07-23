import type { FailureTier } from '../outcome/failure-tier';
import type { Liveness } from './liveness';
import { deriveLiveness } from './liveness-verdict';
import type { ProgressEvent } from './progress-event';
import type { RunId } from './run-id';
import type { RunKind } from './run-kind';
import type { RunSnapshot } from './run-snapshot';
import type { RunState } from './run-state';

interface Accumulator {
  runId: RunId;
  runKind: RunKind;
  subject: string;
  maxTurns: number;
  turnsUsed: number;
  currentStage: string | null;
  artifactPath: string | null;
  artifactValid: boolean | null;
  pendingGate: string | null;
  succeeded: boolean | null;
  failureTier: FailureTier | null;
  lastEventAt: number;
}

function initialAccumulator(): Accumulator {
  return {
    runId: '',
    runKind: 'single-role',
    subject: '',
    maxTurns: 0,
    turnsUsed: 0,
    currentStage: null,
    artifactPath: null,
    artifactValid: null,
    pendingGate: null,
    succeeded: null,
    failureTier: null,
    lastEventAt: 0,
  };
}

function applyEvent(accumulator: Accumulator, event: ProgressEvent): void {
  accumulator.lastEventAt = event.timestamp;
  switch (event.type) {
    case 'runLaunched':
      accumulator.runId = event.runId;
      accumulator.runKind = event.runKind;
      accumulator.subject = event.subject;
      accumulator.maxTurns = event.maxTurns;
      accumulator.artifactPath = event.artifactPath;
      break;
    case 'turnCompleted':
      accumulator.turnsUsed = event.turnIndex + 1;
      break;
    case 'artifactValidated':
      accumulator.artifactPath = event.artifactPath;
      accumulator.artifactValid = event.valid;
      break;
    case 'repairAttempted':
      break;
    case 'stageStarted':
      accumulator.currentStage = event.stage;
      accumulator.pendingGate = null;
      break;
    case 'stageCompleted':
      break;
    case 'gateWaitEntered':
      accumulator.pendingGate = event.stage;
      break;
    case 'gateWaitResolved':
      accumulator.pendingGate = null;
      break;
    case 'terminalOutcome':
      accumulator.succeeded = event.succeeded;
      accumulator.failureTier = event.failureTier;
      break;
  }
}

function deriveState(
  accumulator: Accumulator,
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): RunState {
  if (accumulator.succeeded !== null) {
    return accumulator.succeeded ? 'succeeded' : 'failed';
  }
  const liveness: Liveness = deriveLiveness(stampedAt, now, thresholdMs);
  if (liveness === 'stalled') {
    return 'stalled';
  }
  if (accumulator.pendingGate !== null) {
    return 'awaiting-gate';
  }
  return 'running';
}

export function deriveSnapshot(
  events: readonly ProgressEvent[],
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): RunSnapshot {
  const accumulator: Accumulator = initialAccumulator();
  for (const event of events) {
    applyEvent(accumulator, event);
  }
  const state: RunState = deriveState(accumulator, stampedAt, now, thresholdMs);
  return {
    runId: accumulator.runId,
    runKind: accumulator.runKind,
    state,
    subject: accumulator.subject,
    currentStage: accumulator.currentStage,
    turnsUsed: accumulator.turnsUsed,
    maxTurns: accumulator.maxTurns,
    artifactPath: accumulator.artifactPath,
    artifactValid: accumulator.artifactValid,
    pendingGate: accumulator.pendingGate,
    failureTier: accumulator.failureTier,
    lastEventAt: accumulator.lastEventAt,
  };
}
