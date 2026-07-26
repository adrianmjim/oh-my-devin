import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import type { RoundInput } from './round-input';
import { seatInvocationFor } from './seat-invocation-for';

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'security',
  lens: 'auth',
  proposer: false,
  contrarian: false,
  model: null,
};

function input(evidenceSummary: string | null): RoundInput {
  const council: CouncilDeclaration = {
    name: 'c',
    seats: [SEAT],
    tunables: { roundsCap: 3, blockingThreshold: 'high', wallTimeMs: null },
    authority: 'human',
  };
  return {
    council,
    question: 'should we ship?',
    round: 1,
    incomingProposal: 'ship it',
    priorPositions: [],
    evidenceSummary,
    seatInvoker: () => Promise.resolve([]),
    proposerAction: () =>
      Promise.resolve({ proposal: 'p', clarifications: [] }),
  };
}

describe('seatInvocationFor', () => {
  it('carries the seat, question, proposal, and phase', () => {
    const invocation = seatInvocationFor(
      input(null),
      SEAT,
      'ship it',
      'position',
      {
        priorArguments: [],
        clarifications: [],
      },
    );

    expect(invocation.seat).toBe(SEAT);
    expect(invocation.question).toBe('should we ship?');
    expect(invocation.proposal).toBe('ship it');
    expect(invocation.phase).toBe('position');
  });

  it('relays the round evidence summary', () => {
    expect(
      seatInvocationFor(input('the evidence'), SEAT, 'p', 'position', {
        priorArguments: [],
        clarifications: [],
      }).evidenceSummary,
    ).toBe('the evidence');
  });

  it('relays the prior arguments and clarifications of its context', () => {
    const invocation = seatInvocationFor(
      input(null),
      SEAT,
      'p',
      'clarification',
      {
        priorArguments: [
          {
            kind: 'objection',
            severity: 'high',
            domain: 'auth',
            concern: 'leak',
          },
        ],
        clarifications: [{ question: 'why?', answer: null }],
      },
    );

    expect(invocation.priorArguments).toHaveLength(1);
    expect(invocation.clarifications).toHaveLength(1);
  });
});
