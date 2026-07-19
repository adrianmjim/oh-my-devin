import type { CouncilSeat } from '../council/council-seat';
import type { AnonymizedArgument } from './anonymized-argument';
import type { ConsentResult } from './consent-result';
import { DeliberationError } from './deliberation-error';
import { evaluateConsent } from './evaluate-consent';
import { relayAnonymized } from './relay-anonymized';
import type { RoundInput } from './round-input';
import type { RoundResult } from './round-result';
import type { TypedPosition } from './typed-position';

export async function runRound(input: RoundInput): Promise<RoundResult> {
  const proposal: string = await resolveProposal(input);
  const priorArguments: readonly AnonymizedArgument[] = relayAnonymized(
    input.priorPositions,
  );

  const positions: TypedPosition[] = [];
  for (const seat of input.council.seats) {
    if (seat.proposer) {
      continue;
    }
    const position: TypedPosition = await input.seatInvoker({
      seat,
      proposal,
      priorArguments,
    });
    positions.push(position);
  }

  const consent: ConsentResult = evaluateConsent(
    positions,
    input.council.tunables.blockingThreshold,
  );

  const nextProposal: string = await integrate(input, proposal, consent);

  return { proposal: nextProposal, positions, consent };
}

async function resolveProposal(input: RoundInput): Promise<string> {
  if (input.incomingProposal !== null) {
    return input.incomingProposal;
  }
  const proposer: CouncilSeat | undefined = proposerSeat(input);
  if (proposer === undefined) {
    throw new DeliberationError(
      'deliberation has no attached proposal and no proposer seat',
    );
  }
  return input.proposerAction({
    seat: proposer,
    question: input.question,
    currentProposal: null,
    blocking: [],
  });
}

async function integrate(
  input: RoundInput,
  proposal: string,
  consent: ConsentResult,
): Promise<string> {
  if (consent.consented) {
    return proposal;
  }
  const proposer: CouncilSeat | undefined = proposerSeat(input);
  if (proposer === undefined) {
    return proposal;
  }
  return input.proposerAction({
    seat: proposer,
    question: input.question,
    currentProposal: proposal,
    blocking: consent.blocking,
  });
}

function proposerSeat(input: RoundInput): CouncilSeat | undefined {
  return input.council.seats.find(
    (seat: CouncilSeat): boolean => seat.proposer,
  );
}
