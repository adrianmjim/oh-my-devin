import type { RunId } from '../observability/run-id';
import type { SessionId } from './session-id';

export interface ModeActivation {
  readonly mode: string;
  readonly sessionId: SessionId;
  readonly activatedAt: number;
  readonly correlatedRunId: RunId | null;
}
