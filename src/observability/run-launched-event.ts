import type { RunId } from './run-id';
import type { RunKind } from './run-kind';

export interface RunLaunchedEvent {
  readonly type: 'runLaunched';
  readonly timestamp: number;
  readonly runId: RunId;
  readonly runKind: RunKind;
  readonly subject: string;
  readonly maxTurns: number;
  readonly artifactPath: string | null;
}
