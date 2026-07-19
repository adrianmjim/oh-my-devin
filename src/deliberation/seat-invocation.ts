import type { CouncilSeat } from '../council/council-seat';
import type { AnonymizedArgument } from './anonymized-argument';
import type { RelayedClarification } from './relayed-clarification';
import type { SeatPhase } from './seat-phase';

export interface SeatInvocation {
  readonly seat: CouncilSeat;
  readonly question: string;
  readonly proposal: string;
  readonly phase: SeatPhase;
  readonly priorArguments: readonly AnonymizedArgument[];
  readonly clarifications: readonly RelayedClarification[];
  readonly evidenceSummary: string | null;
}
