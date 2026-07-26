import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import { answerClarificationQuestions } from './answer-clarification-questions';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import type { RoundInput } from './round-input';

function seat(id: string, proposer: boolean): CouncilSeat {
  return { id, role: id, lens: id, proposer, contrarian: false, model: null };
}

function input(
  seats: readonly CouncilSeat[],
  proposerAction: (request: ProposerRequest) => Promise<ProposerResult>,
): RoundInput {
  const council: CouncilDeclaration = {
    name: 'c',
    seats,
    tunables: { roundsCap: 3, blockingThreshold: 'high', wallTimeMs: null },
    authority: 'human',
  };
  return {
    council,
    question: 'q',
    round: 1,
    incomingProposal: 'p',
    priorPositions: [],
    evidenceSummary: null,
    seatInvoker: () => Promise.resolve([]),
    proposerAction,
  };
}

describe('answerClarificationQuestions', () => {
  it('is empty when nothing was asked', async () => {
    expect(
      await answerClarificationQuestions(
        input([seat('a', true)], () =>
          Promise.resolve({
            proposal: 'p',
            clarifications: [],
          }),
        ),
        'p',
        [],
      ),
    ).toEqual([]);
  });

  it('leaves every question unanswered when no seat proposes', async () => {
    expect(
      await answerClarificationQuestions(
        input([seat('a', false)], () =>
          Promise.resolve({
            proposal: 'p',
            clarifications: [],
          }),
        ),
        'p',
        ['why?'],
      ),
    ).toEqual([{ question: 'why?', answer: null }]);
  });

  it('relays the answer the proposer gave to each question', async () => {
    expect(
      await answerClarificationQuestions(
        input([seat('a', true)], () =>
          Promise.resolve({
            proposal: 'p',
            clarifications: [{ question: 'why?', answer: 'because' }],
          }),
        ),
        'p',
        ['why?'],
      ),
    ).toEqual([{ question: 'why?', answer: 'because' }]);
  });

  it('leaves a question the proposer skipped unanswered', async () => {
    expect(
      await answerClarificationQuestions(
        input([seat('a', true)], () =>
          Promise.resolve({
            proposal: 'p',
            clarifications: [],
          }),
        ),
        'p',
        ['why?'],
      ),
    ).toEqual([{ question: 'why?', answer: null }]);
  });

  it('asks the proposer about the current proposal, not for a revision', async () => {
    const requests: ProposerRequest[] = [];

    await answerClarificationQuestions(
      input([seat('a', true)], (request: ProposerRequest) => {
        requests.push(request);
        return Promise.resolve({ proposal: 'p', clarifications: [] });
      }),
      'ship it',
      ['why?'],
    );

    expect(requests[0]?.currentProposal).toBe('ship it');
    expect(requests[0]?.blocking).toEqual([]);
    expect(requests[0]?.clarificationQuestions).toEqual(['why?']);
  });
});
