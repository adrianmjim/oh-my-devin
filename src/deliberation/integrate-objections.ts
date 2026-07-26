import type { CouncilSeat } from '../council/council-seat';
import type { ConsentResult } from './consent-result';
import type { ProposerResult } from './proposer-result';
import { proposerSeat } from './proposer-seat';
import type { RoundInput } from './round-input';

export async function integrateObjections(
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
