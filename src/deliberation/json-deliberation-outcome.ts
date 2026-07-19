import type { AuthorityPolicy } from '../council/authority-policy';
import type { ClosureState } from './closure-state';
import type { GateResolution } from './gate-resolution';
import type { ProposalSource } from './proposal-source';

export interface JsonDeliberationOutcome {
  readonly question: string;
  readonly closure: ClosureState;
  readonly proposal: string;
  readonly proposalSource: ProposalSource;
  readonly authorityApplied: AuthorityPolicy;
  readonly resolution: GateResolution;
  readonly humanDecisionRequired: boolean;
  readonly objections: number;
  readonly dissent: number;
  readonly bridgeLaunched: boolean;
  readonly exitCode: number;
}
