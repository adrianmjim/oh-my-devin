import type { CouncilSeat } from '../council/council-seat';
import type { AnonymizedArgument } from './anonymized-argument';
import { requireSeatClarification } from './require-seat-clarification';
import type { RoundInput } from './round-input';
import type { SeatClarification } from './seat-clarification';
import type { SeatInvocation } from './seat-invocation';
import { seatInvocationFor } from './seat-invocation-for';
import type { SeatPosition } from './seat-position';

export async function collectClarificationQuestions(
  input: RoundInput,
  seats: readonly CouncilSeat[],
  proposal: string,
  priorArguments: readonly AnonymizedArgument[],
): Promise<readonly string[]> {
  const responses: readonly SeatPosition[] = await input.seatInvoker(
    seats.map((seat: CouncilSeat): SeatInvocation =>
      seatInvocationFor(input, seat, proposal, 'clarification', {
        priorArguments,
        clarifications: [],
      }),
    ),
  );
  const questions: string[] = [];
  for (const response of responses) {
    const clarification: SeatClarification = requireSeatClarification(response);
    for (const question of clarification.questions) {
      if (!questions.includes(question)) {
        questions.push(question);
      }
    }
  }
  return questions;
}
