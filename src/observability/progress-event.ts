import type { ArtifactValidatedEvent } from './artifact-validated-event';
import type { GateWaitEnteredEvent } from './gate-wait-entered-event';
import type { GateWaitResolvedEvent } from './gate-wait-resolved-event';
import type { RepairAttemptedEvent } from './repair-attempted-event';
import type { RunLaunchedEvent } from './run-launched-event';
import type { StageCompletedEvent } from './stage-completed-event';
import type { StageStartedEvent } from './stage-started-event';
import type { TerminalOutcomeEvent } from './terminal-outcome-event';
import type { TurnCompletedEvent } from './turn-completed-event';

export type ProgressEvent =
  | RunLaunchedEvent
  | TurnCompletedEvent
  | ArtifactValidatedEvent
  | RepairAttemptedEvent
  | StageStartedEvent
  | StageCompletedEvent
  | GateWaitEnteredEvent
  | GateWaitResolvedEvent
  | TerminalOutcomeEvent;
