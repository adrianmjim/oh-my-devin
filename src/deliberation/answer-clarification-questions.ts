import type { CouncilSeat } from '../council/council-seat';
import type { ClarificationAnswer } from './clarification-answer';
import type { ProposerResult } from './proposer-result';
import { proposerSeat } from './proposer-seat';
import type { RelayedClarification } from './relayed-clarification';
import type { RoundInput } from './round-input';

export async function answerClarificationQuestions(
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
