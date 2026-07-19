import type { CouncilSeat } from '../council/council-seat';
import type { TypedPosition } from './typed-position';

export interface ProposerRequest {
  readonly seat: CouncilSeat;
  readonly question: string;
  readonly currentProposal: string | null;
  readonly blocking: readonly TypedPosition[];
}
