import type { AuthorityPolicy } from '../council/authority-policy';
import type { ClosureState } from './closure-state';
import type { EchoCluster } from './echo-cluster';
import type { ProposalSource } from './proposal-source';
import type { TypedPosition } from './typed-position';

export interface RecordInput {
  readonly question: string;
  readonly proposal: string;
  readonly proposalSource: ProposalSource;
  readonly closure: ClosureState;
  readonly authority: AuthorityPolicy;
  readonly supporting: readonly EchoCluster[];
  readonly objections: readonly TypedPosition[];
  readonly assumptions: readonly string[];
  readonly reconsiderWhen: readonly string[];
}
