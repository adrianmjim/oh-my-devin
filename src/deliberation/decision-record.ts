import type { AuthorityPolicy } from '../council/authority-policy';
import type { ClosureState } from './closure-state';
import type { ProposalSource } from './proposal-source';
import type { RecordedObjection } from './recorded-objection';
import type { SupportingArgument } from './supporting-argument';

export interface DecisionRecord {
  readonly question: string;
  readonly proposal: string;
  readonly proposalSource: ProposalSource;
  readonly consent: ClosureState;
  readonly authorityApplied: AuthorityPolicy;
  readonly supportingArguments: readonly SupportingArgument[];
  readonly objections: readonly RecordedObjection[];
  readonly assumptions: readonly string[];
  readonly reconsiderWhen: readonly string[];
  readonly humanDecisionRequired: boolean;
}
