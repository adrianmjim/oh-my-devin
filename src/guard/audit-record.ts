import type { SessionId } from '../modes/session-id';
import type { EnforcementLevel } from './enforcement-level';
import type { GuardDecision } from './guard-decision';

export interface AuditRecord {
  readonly timestamp: number;
  readonly tool: string;
  readonly filePath: string;
  readonly decision: GuardDecision;
  readonly reason: string;
  readonly enforcementLevel: EnforcementLevel;
  readonly sessionId: SessionId | null;
}
