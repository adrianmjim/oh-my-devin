import type { ProgressEvent } from './progress-event';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function applyProgressEvent(
  accumulator: SnapshotAccumulator,
  event: ProgressEvent,
): void {
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
