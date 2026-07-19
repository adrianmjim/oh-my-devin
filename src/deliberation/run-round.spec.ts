import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import type { ProposerRequest } from './proposer-request';
import type { RoundInput } from './round-input';
import type { RoundResult } from './round-result';
import type { SeatInvocation } from './seat-invocation';
import type { TypedPosition } from './typed-position';
import { runRound } from './run-round';

function seat(role: string, overrides: Partial<CouncilSeat>): CouncilSeat {
  return {
    role,
    lens: role,
    proposer: false,
    contrarian: false,
    model: null,
    ...overrides,
  };
}

function council(seats: readonly CouncilSeat[]): CouncilDeclaration {
  return {
    name: 'test-council',
    seats,
    tunables: { roundsCap: 3, blockingThreshold: 'high', wallTimeMs: null },
    authority: 'human',
  };
}

function consenting(role: string): TypedPosition {
  return {
    seat: role,
    lens: role,
    kind: 'preference',
    domain: role,
    severity: 'low',
    concern: `${role}-fine`,
  };
}

function blocking(role: string): TypedPosition {
  return {
    seat: role,
    lens: role,
    kind: 'objection',
    domain: role,
    severity: 'high',
    concern: `${role}-blocks`,
  };
}

interface Recorder {
  readonly invocations: SeatInvocation[];
  readonly proposerRequests: ProposerRequest[];
}

function baseInput(
  decl: CouncilDeclaration,
  positions: Record<string, TypedPosition>,
  recorder: Recorder,
  overrides: Partial<RoundInput>,
): RoundInput {
  return {
    council: decl,
    question: 'service decomposition?',
    round: 1,
    incomingProposal: 'modular-monolith',
    priorPositions: [],
    seatInvoker: (invocation: SeatInvocation): Promise<TypedPosition> => {
      recorder.invocations.push(invocation);
      const position: TypedPosition | undefined =
        positions[invocation.seat.role];
      return Promise.resolve(position ?? consenting(invocation.seat.role));
    },
    proposerAction: (request: ProposerRequest): Promise<string> => {
      recorder.proposerRequests.push(request);
      return Promise.resolve('revised-proposal');
    },
    ...overrides,
  };
}

describe('runRound', () => {
  it('invokes each seat once with the proposal and anonymized prior arguments', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    const input: RoundInput = baseInput(decl, {}, recorder, {
      round: 2,
      priorPositions: [blocking('sre')],
    });

    await runRound(input);

    expect(recorder.invocations).toHaveLength(2);
    for (const invocation of recorder.invocations) {
      expect(invocation.proposal).toBe('modular-monolith');
      for (const argument of invocation.priorArguments) {
        expect('seat' in argument).toBe(false);
      }
    }
  });

  it('excludes the proposer seat from the position-assessment loop', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('security', {}),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    const result: RoundResult = await runRound(
      baseInput(decl, {}, recorder, {}),
    );

    const assessed: readonly string[] = recorder.invocations.map(
      (invocation: SeatInvocation): string => invocation.seat.role,
    );
    expect(assessed).toEqual(['security', 'sre']);
    expect(result.positions).toHaveLength(2);
  });

  it('reports a consent close when no objection blocks', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    const result: RoundResult = await runRound(
      baseInput(decl, {}, recorder, {}),
    );

    expect(result.consent.consented).toBe(true);
    expect(result.positions).toHaveLength(2);
  });

  it('has the proposer revise when a blocking objection stands', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    const result: RoundResult = await runRound(
      baseInput(decl, { sre: blocking('sre') }, recorder, {}),
    );

    expect(result.consent.consented).toBe(false);
    expect(result.proposal).toBe('revised-proposal');
    const revision: ProposerRequest | undefined =
      recorder.proposerRequests.at(-1);
    expect(revision?.blocking.map((b) => b.seat)).toEqual(['sre']);
  });

  it('leaves the proposal unrevised when a blocking objection stands and no proposer exists', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    const result: RoundResult = await runRound(
      baseInput(decl, { sre: blocking('sre') }, recorder, {}),
    );

    expect(result.consent.consented).toBe(false);
    expect(result.proposal).toBe('modular-monolith');
    expect(recorder.proposerRequests).toHaveLength(0);
  });

  it('drafts a proposal in round 1 when none is attached and a proposer exists', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    await runRound(baseInput(decl, {}, recorder, { incomingProposal: null }));

    const draft: ProposerRequest | undefined = recorder.proposerRequests.at(0);
    expect(draft?.currentProposal).toBeNull();
    expect(recorder.invocations[0]?.proposal).toBe('revised-proposal');
  });

  it('fails when no proposal is attached and no proposer exists', async () => {
    const decl: CouncilDeclaration = council([seat('architect', {})]);
    const recorder: Recorder = { invocations: [], proposerRequests: [] };
    await expect(
      runRound(baseInput(decl, {}, recorder, { incomingProposal: null })),
    ).rejects.toThrow(DeliberationError);
  });
});
