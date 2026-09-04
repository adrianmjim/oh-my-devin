import type { EnforcementLevel } from './enforcement-level';

export interface GuardDecisionInput {
  readonly level: EnforcementLevel;
  readonly outOfScope: boolean;
  readonly tool: string;
  readonly filePath: string;
  readonly reason: string;
  readonly at: number;
}
