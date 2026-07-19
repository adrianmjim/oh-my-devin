import type { Clock } from '../budget/clock';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { TeamDefinition } from '../team/team-definition';
import type { ArgumentClusterer } from './argument-clusterer';
import type { EvidenceSummarizer } from './evidence-summarizer';
import type { PipelineLauncher } from './pipeline-launcher';
import type { ProposerAction } from './proposer-action';
import type { SeatInvoker } from './seat-invoker';

export interface DeliberationInput {
  readonly council: CouncilDeclaration;
  readonly question: string;
  readonly attachedProposal: string | null;
  readonly team: TeamDefinition | null;
  readonly humanSigned: boolean;
  readonly seatInvoker: SeatInvoker;
  readonly proposerAction: ProposerAction;
  readonly clusterArguments: ArgumentClusterer;
  readonly summarizeEvidence: EvidenceSummarizer;
  readonly launch: PipelineLauncher;
  readonly clock: Clock;
}
