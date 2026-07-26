import type { CouncilSeat } from '../council/council-seat';
import { answerClarificationQuestions } from './answer-clarification-questions';
import type { AnonymizedArgument } from './anonymized-argument';
import { collectClarificationQuestions } from './collect-clarification-questions';
import type { ConsentResult } from './consent-result';
import { evaluateConsent } from './evaluate-consent';
import { integrateObjections } from './integrate-objections';
import { relayAnonymized } from './relay-anonymized';
import type { RelayedClarification } from './relayed-clarification';
import { requireTypedPosition } from './require-typed-position';
import { resolveProposal } from './resolve-proposal';
import type { RoundInput } from './round-input';
import type { RoundResult } from './round-result';
import type { SeatInvocation } from './seat-invocation';
import { seatInvocationFor } from './seat-invocation-for';
import type { SeatPosition } from './seat-position';
import type { TypedPosition } from './typed-position';

export async function runRound(input: RoundInput): Promise<RoundResult> {
  const proposal: string = await resolveProposal(input);
  const priorArguments: readonly AnonymizedArgument[] = relayAnonymized(
    input.priorPositions,
  );
  const seats: readonly CouncilSeat[] = input.council.seats.filter(
    (seat: CouncilSeat): boolean => !seat.proposer,
  );

  const questions: readonly string[] = await collectClarificationQuestions(
    input,
    seats,
    proposal,
    priorArguments,
  );
  const clarifications: readonly RelayedClarification[] =
    await answerClarificationQuestions(input, proposal, questions);

  const responses: readonly SeatPosition[] = await input.seatInvoker(
    seats.map((seat: CouncilSeat): SeatInvocation =>
      seatInvocationFor(input, seat, proposal, 'position', {
        priorArguments,
        clarifications,
      }),
    ),
  );
  const positions: readonly TypedPosition[] =
    responses.map(requireTypedPosition);

  const consent: ConsentResult = evaluateConsent(
    positions,
    input.council.tunables.blockingThreshold,
  );

  const nextProposal: string = await integrateObjections(
    input,
    proposal,
    consent,
  );

  return { proposal: nextProposal, positions, consent };
}
