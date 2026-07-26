import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import { collectClarificationQuestions } from './collect-clarification-questions';
import { DeliberationError } from './deliberation-error';
import type { RoundInput } from './round-input';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPosition } from './seat-position';

function seat(id: string): CouncilSeat {
  return {
    id,
    role: id,
    lens: id,
    proposer: false,
    contrarian: false,
    model: null,
  };
}

function input(
  seatInvoker: (
    invocations: readonly SeatInvocation[],
  ) => Promise<readonly SeatPosition[]>,
): RoundInput {
  const council: CouncilDeclaration = {
    name: 'c',
    seats: [seat('a'), seat('b')],
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
    seatInvoker,
    proposerAction: () =>
      Promise.resolve({ proposal: 'p', clarifications: [] }),
  };
}

function clarification(id: string, questions: readonly string[]): SeatPosition {
  return { seat: id, lens: id, kind: 'clarification', questions };
}

describe('collectClarificationQuestions', () => {
  it('gathers the questions every seat raises', async () => {
    const questions = await collectClarificationQuestions(
      input(() =>
        Promise.resolve([
          clarification('a', ['why?']),
          clarification('b', ['when?']),
        ]),
      ),
      [seat('a'), seat('b')],
      'p',
      [],
    );

    expect(questions).toEqual(['why?', 'when?']);
  });

  it('asks every seat in the clarification phase', async () => {
    const phases: string[] = [];

    await collectClarificationQuestions(
      input((invocations: readonly SeatInvocation[]) => {
        phases.push(...invocations.map((i: SeatInvocation): string => i.phase));
        return Promise.resolve(
          invocations.map((i: SeatInvocation): SeatPosition =>
            clarification(i.seat.id, []),
          ),
        );
      }),
      [seat('a'), seat('b')],
      'p',
      [],
    );

    expect(phases).toEqual(['clarification', 'clarification']);
  });

  it('raises a repeated question only once', async () => {
    const questions = await collectClarificationQuestions(
      input(() =>
        Promise.resolve([
          clarification('a', ['why?']),
          clarification('b', ['why?']),
        ]),
      ),
      [seat('a'), seat('b')],
      'p',
      [],
    );

    expect(questions).toEqual(['why?']);
  });

  it('refuses a seat that answers with a typed position', async () => {
    await expect(
      collectClarificationQuestions(
        input(() =>
          Promise.resolve([
            {
              seat: 'a',
              lens: 'a',
              kind: 'objection',
              domain: 'a',
              severity: 'high',
              concern: 'no',
              assumptions: [],
              reconsiderWhen: [],
            },
          ]),
        ),
        [seat('a')],
        'p',
        [],
      ),
    ).rejects.toThrow(DeliberationError);
  });
});
