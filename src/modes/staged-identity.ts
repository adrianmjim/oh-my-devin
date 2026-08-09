import type { SessionId } from './session-id';

export interface StagedIdentity {
  readonly sessionId: SessionId;
  readonly invocation: string;
  readonly stagedAt: number;
}
