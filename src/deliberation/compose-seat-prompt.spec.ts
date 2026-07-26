import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { composeSeatPrompt } from './compose-seat-prompt';
import type { SeatInvocation } from './seat-invocation';

function seat(overrides: Partial<CouncilSeat>): CouncilSeat {
  return {
    id: 'security',
    role: 'reviewer',
    lens: 'auth',
    proposer: false,
    contrarian: false,
    model: null,
    ...overrides,
  };
}

function invocation(overrides: Partial<SeatInvocation>): SeatInvocation {
  return {
    seat: seat({}),
    question: 'should we ship?',
    proposal: 'ship behind a flag',
    phase: 'position',
    priorArguments: [],
    clarifications: [],
    evidenceSummary: null,
    ...overrides,
  };
}

describe('composeSeatPrompt', () => {
  it('opens by naming the lens the seat holds', () => {
    expect(composeSeatPrompt(invocation({}))).toContain(
      'You hold the "auth" lens on this council.',
    );
  });

  it('charges the contrarian seat to challenge the consensus', () => {
    expect(
      composeSeatPrompt(invocation({ seat: seat({ contrarian: true }) })),
    ).toContain('You are the contrarian seat');
  });

  it('asks for questions in the clarification phase', () => {
    expect(composeSeatPrompt(invocation({ phase: 'clarification' }))).toContain(
      '"kind": "clarification"',
    );
  });

  it('asks for a position in the position phase', () => {
    expect(composeSeatPrompt(invocation({}))).toContain('state your position');
  });

  it('carries the question and the proposal', () => {
    const prompt: string = composeSeatPrompt(invocation({}));

    expect(prompt).toContain('## Question\nshould we ship?');
    expect(prompt).toContain('## Proposal\nship behind a flag');
  });

  it('omits the optional sections when they carry nothing', () => {
    const prompt: string = composeSeatPrompt(invocation({}));

    expect(prompt).not.toContain('## Clarifications');
    expect(prompt).not.toContain('## Evidence summary');
    expect(prompt).not.toContain('## Prior arguments');
  });

  it('relays the clarifications, evidence, and prior arguments it is given', () => {
    const prompt: string = composeSeatPrompt(
      invocation({
        clarifications: [{ question: 'why?', answer: 'safe' }],
        evidenceSummary: 'the evidence',
        priorArguments: [
          {
            kind: 'objection',
            severity: 'high',
            domain: 'auth',
            concern: 'leak',
          },
        ],
      }),
    );

    expect(prompt).toContain('## Clarifications\n- Q: why?');
    expect(prompt).toContain('## Evidence summary\nthe evidence');
    expect(prompt).toContain(
      '## Prior arguments\n- [objection/high] auth: leak',
    );
  });
});
