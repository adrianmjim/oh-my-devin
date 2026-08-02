import { eventStateOf } from './event-state-of';
import type { ProgressEvent } from './progress-event';
import type { RunState } from './run-state';
import type { SnapshotAccumulator } from './snapshot-accumulator';

export function applyProgressEvent(
  accumulator: SnapshotAccumulator,
  event: ProgressEvent,
): void {
  const firstEvent: boolean = accumulator.lastEventAt === 0;
  const stateBefore: RunState = eventStateOf(accumulator);
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
  if (firstEvent || eventStateOf(accumulator) !== stateBefore) {
    accumulator.stateEnteredAt = event.timestamp;
  }
}
