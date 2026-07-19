import type { CouncilSeat } from '../council/council-seat';
import type { AnonymizedArgument } from './anonymized-argument';

export interface SeatInvocation {
  readonly seat: CouncilSeat;
  readonly proposal: string;
  readonly priorArguments: readonly AnonymizedArgument[];
}
