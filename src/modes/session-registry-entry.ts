import type { SessionId } from './session-id';

export interface SessionRegistryEntry {
  readonly sessionId: SessionId;
  readonly lastSeenAt: number;
}
