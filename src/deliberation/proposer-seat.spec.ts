import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import { proposerSeat } from './proposer-seat';
import type { RoundInput } from './round-input';

function seat(id: string, proposer: boolean): CouncilSeat {
  return { id, role: id, lens: id, proposer, contrarian: false, model: null };
}

function input(seats: readonly CouncilSeat[]): RoundInput {
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
    proposerAction: () =>
      Promise.resolve({ proposal: 'p', clarifications: [] }),
  };
}

describe('proposerSeat', () => {
  it('finds the seat declared as proposer', () => {
    expect(proposerSeat(input([seat('a', false), seat('b', true)]))?.id).toBe(
      'b',
    );
  });

  it('is undefined when no seat proposes', () => {
    expect(proposerSeat(input([seat('a', false)]))).toBeUndefined();
  });
});
