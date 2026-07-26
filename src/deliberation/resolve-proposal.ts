import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import type { ProposerResult } from './proposer-result';
import { proposerSeat } from './proposer-seat';
import type { RoundInput } from './round-input';

export async function resolveProposal(input: RoundInput): Promise<string> {
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
