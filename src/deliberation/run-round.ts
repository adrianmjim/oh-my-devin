import type { CouncilSeat } from '../council/council-seat';
import type { AnonymizedArgument } from './anonymized-argument';
import type { ClarificationAnswer } from './clarification-answer';
import type { ConsentResult } from './consent-result';
import { DeliberationError } from './deliberation-error';
import { evaluateConsent } from './evaluate-consent';
import type { ProposerResult } from './proposer-result';
import { relayAnonymized } from './relay-anonymized';
import type { RelayedClarification } from './relayed-clarification';
import type { RoundInput } from './round-input';
import type { RoundResult } from './round-result';
import type { SeatClarification } from './seat-clarification';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPhase } from './seat-phase';
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

  const questions: readonly string[] = await collectQuestions(
    input,
    seats,
    proposal,
    priorArguments,
  );
  const clarifications: readonly RelayedClarification[] = await answerQuestions(
    input,
    proposal,
    questions,
  );

  const responses: readonly SeatPosition[] = await input.seatInvoker(
    seats.map((seat: CouncilSeat): SeatInvocation =>
      invocationFor(input, seat, proposal, 'position', {
        priorArguments,
        clarifications,
      }),
    ),
  );
  const positions: readonly TypedPosition[] = responses.map(requirePosition);

  const consent: ConsentResult = evaluateConsent(
    positions,
    input.council.tunables.blockingThreshold,
  );

  const nextProposal: string = await integrate(input, proposal, consent);

  return { proposal: nextProposal, positions, consent };
}

interface RelayedContext {
  readonly priorArguments: readonly AnonymizedArgument[];
  readonly clarifications: readonly RelayedClarification[];
}

function invocationFor(
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

async function collectQuestions(
  input: RoundInput,
  seats: readonly CouncilSeat[],
  proposal: string,
  priorArguments: readonly AnonymizedArgument[],
): Promise<readonly string[]> {
  const responses: readonly SeatPosition[] = await input.seatInvoker(
    seats.map((seat: CouncilSeat): SeatInvocation =>
      invocationFor(input, seat, proposal, 'clarification', {
        priorArguments,
        clarifications: [],
      }),
    ),
  );
  const questions: string[] = [];
  for (const response of responses) {
    const clarification: SeatClarification = requireClarification(response);
    for (const question of clarification.questions) {
      if (!questions.includes(question)) {
        questions.push(question);
      }
    }
  }
  return questions;
}

async function answerQuestions(
  input: RoundInput,
  proposal: string,
  questions: readonly string[],
): Promise<readonly RelayedClarification[]> {
  if (questions.length === 0) {
    return [];
  }
  const proposer: CouncilSeat | undefined = proposerSeat(input);
  if (proposer === undefined) {
    return questions.map((question: string): RelayedClarification => ({
      question,
      answer: null,
    }));
  }
  const result: ProposerResult = await input.proposerAction({
    seat: proposer,
    question: input.question,
    currentProposal: proposal,
    blocking: [],
    clarificationQuestions: questions,
  });
  return questions.map((question: string): RelayedClarification => ({
    question,
    answer:
      result.clarifications.find(
        (answer: ClarificationAnswer): boolean => answer.question === question,
      )?.answer ?? null,
  }));
}

function requirePosition(response: SeatPosition): TypedPosition {
  if (response.kind === 'clarification') {
    throw new DeliberationError(
      `seat "${response.seat}" must emit a typed position in the objection phase`,
    );
  }
  return response;
}

function requireClarification(response: SeatPosition): SeatClarification {
  if (response.kind !== 'clarification') {
    throw new DeliberationError(
      `seat "${response.seat}" must emit a clarification in the clarifications phase`,
    );
  }
  return response;
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
  const drafted: ProposerResult = await input.proposerAction({
    seat: proposer,
    question: input.question,
    currentProposal: null,
    blocking: [],
    clarificationQuestions: [],
  });
  return drafted.proposal;
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
  const revised: ProposerResult = await input.proposerAction({
    seat: proposer,
    question: input.question,
    currentProposal: proposal,
    blocking: consent.blocking,
    clarificationQuestions: [],
  });
  return revised.proposal;
}

function proposerSeat(input: RoundInput): CouncilSeat | undefined {
  return input.council.seats.find(
    (seat: CouncilSeat): boolean => seat.proposer,
  );
}
