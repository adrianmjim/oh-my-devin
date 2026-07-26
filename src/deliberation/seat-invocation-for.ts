import type { CouncilSeat } from '../council/council-seat';
import type { RelayedContext } from './relayed-context';
import type { RoundInput } from './round-input';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPhase } from './seat-phase';

export function seatInvocationFor(
  input: RoundInput,
  seat: CouncilSeat,
  proposal: string,
  phase: SeatPhase,
  context: RelayedContext,
): SeatInvocation {
  return {
    seat,
    question: input.question,
    proposal,
    phase,
    priorArguments: context.priorArguments,
    clarifications: context.clarifications,
    evidenceSummary: input.evidenceSummary,
  };
}
