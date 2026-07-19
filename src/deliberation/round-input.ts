import type { CouncilDeclaration } from '../council/council-declaration';
import type { ProposerAction } from './proposer-action';
import type { SeatInvoker } from './seat-invoker';
import type { TypedPosition } from './typed-position';

export interface RoundInput {
  readonly council: CouncilDeclaration;
  readonly question: string;
  readonly round: number;
  readonly incomingProposal: string | null;
  readonly priorPositions: readonly TypedPosition[];
  readonly seatInvoker: SeatInvoker;
  readonly proposerAction: ProposerAction;
}
