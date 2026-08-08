import type { SessionId } from './session-id';

export interface SessionModeHolder {
  readonly mode: string;
  readonly sessionId: SessionId;
}
