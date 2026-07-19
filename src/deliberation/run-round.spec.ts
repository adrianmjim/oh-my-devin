import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import type { ClarificationAnswer } from './clarification-answer';
import { DeliberationError } from './deliberation-error';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import type { RoundInput } from './round-input';
import type { RoundResult } from './round-result';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPosition } from './seat-position';
import type { TypedPosition } from './typed-position';
import { runRound } from './run-round';

function seat(role: string, overrides: Partial<CouncilSeat>): CouncilSeat {
  return {
    id: role,
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
    assumptions: [],
    reconsiderWhen: [],
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
    assumptions: [],
    reconsiderWhen: [],
  };
}

interface Recorder {
  readonly events: string[];
  readonly clarificationBatches: SeatInvocation[][];
  readonly positionBatches: SeatInvocation[][];
  readonly proposerRequests: ProposerRequest[];
}

function recorder(): Recorder {
  return {
    events: [],
    clarificationBatches: [],
    positionBatches: [],
    proposerRequests: [],
  };
}

function baseInput(
  decl: CouncilDeclaration,
  positions: Record<string, TypedPosition>,
  questions: Record<string, readonly string[]>,
  record: Recorder,
  overrides: Partial<RoundInput>,
): RoundInput {
  return {
    council: decl,
    question: 'service decomposition?',
    round: 1,
    incomingProposal: 'modular-monolith',
    priorPositions: [],
    evidenceSummary: null,
    seatInvoker: (
      invocations: readonly SeatInvocation[],
    ): Promise<readonly SeatPosition[]> => {
      const phase: string = invocations[0]?.phase ?? 'position';
      record.events.push(phase);
      if (phase === 'clarification') {
        record.clarificationBatches.push([...invocations]);
        return Promise.resolve(
          invocations.map((invocation: SeatInvocation): SeatPosition => ({
            seat: invocation.seat.role,
            lens: invocation.seat.lens,
            kind: 'clarification',
            questions: questions[invocation.seat.role] ?? [],
          })),
        );
      }
      record.positionBatches.push([...invocations]);
      return Promise.resolve(
        invocations.map(
          (invocation: SeatInvocation): SeatPosition =>
            positions[invocation.seat.role] ?? consenting(invocation.seat.role),
        ),
      );
    },
    proposerAction: (request: ProposerRequest): Promise<ProposerResult> => {
      record.proposerRequests.push(request);
      if (request.currentProposal === null) {
        record.events.push('draft');
        return Promise.resolve({ proposal: 'drafted', clarifications: [] });
      }
      if (request.clarificationQuestions.length > 0) {
        record.events.push('answer');
        return Promise.resolve({
          proposal: request.currentProposal,
          clarifications: request.clarificationQuestions.map(
            (question: string): ClarificationAnswer => ({
              question,
              answer: `${question}-answer`,
            }),
          ),
        });
      }
      record.events.push('revise');
      return Promise.resolve({
        proposal: 'revised-proposal',
        clarifications: [],
      });
    },
    ...overrides,
  };
}

describe('runRound', () => {
  it('runs proposal, clarifications, typed objections, integration, and consent re-test in order', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const result: RoundResult = await runRound(
      baseInput(
        decl,
        { sre: blocking('sre') },
        { sre: ['how is it deployed?'] },
        record,
        { incomingProposal: null },
      ),
    );

    expect(record.events).toEqual([
      'draft',
      'clarification',
      'answer',
      'position',
      'revise',
    ]);
    expect(result.consent.consented).toBe(false);
    expect(result.proposal).toBe('revised-proposal');
  });

  it('invokes each non-proposer seat once per phase with the question and proposal', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const input: RoundInput = baseInput(decl, {}, {}, record, {
      round: 2,
      priorPositions: [blocking('sre')],
      evidenceSummary: 'prior-summary',
    });

    await runRound(input);

    expect(record.clarificationBatches[0]).toHaveLength(2);
    expect(record.positionBatches[0]).toHaveLength(2);
    for (const invocation of record.positionBatches[0] ?? []) {
      expect(invocation.question).toBe('service decomposition?');
      expect(invocation.proposal).toBe('modular-monolith');
      expect(invocation.evidenceSummary).toBe('prior-summary');
      for (const argument of invocation.priorArguments) {
        expect('seat' in argument).toBe(false);
      }
    }
  });

  it('skips the proposer answer when no clarification questions are posed', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    await runRound(baseInput(decl, {}, {}, record, {}));

    expect(record.events).toEqual(['clarification', 'position']);
  });

  it('relays deduplicated question-and-answer pairs to the position phase without attribution', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('security', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    await runRound(
      baseInput(
        decl,
        {},
        {
          security: ['how is it deployed?', 'who owns rollback?'],
          sre: ['how is it deployed?'],
        },
        record,
        {},
      ),
    );

    const relayed = record.positionBatches[0]?.[0]?.clarifications;
    expect(relayed).toEqual([
      {
        question: 'how is it deployed?',
        answer: 'how is it deployed?-answer',
      },
      { question: 'who owns rollback?', answer: 'who owns rollback?-answer' },
    ]);
  });

  it('relays open questions when no proposer exists to answer them', async () => {
    const decl: CouncilDeclaration = council([
      seat('security', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    await runRound(
      baseInput(decl, {}, { security: ['who owns rollback?'] }, record, {}),
    );

    expect(record.events).toEqual(['clarification', 'position']);
    expect(record.positionBatches[0]?.[0]?.clarifications).toEqual([
      { question: 'who owns rollback?', answer: null },
    ]);
  });

  it('excludes the proposer seat from both seat phases', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('security', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const result: RoundResult = await runRound(
      baseInput(decl, {}, {}, record, {}),
    );

    const assessed: readonly string[] = (record.positionBatches[0] ?? []).map(
      (invocation: SeatInvocation): string => invocation.seat.role,
    );
    expect(assessed).toEqual(['security', 'sre']);
    expect(
      (record.clarificationBatches[0] ?? []).map(
        (invocation: SeatInvocation): string => invocation.seat.role,
      ),
    ).toEqual(['security', 'sre']);
    expect(result.positions).toHaveLength(2);
  });

  it('reports a consent close when no objection blocks', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const result: RoundResult = await runRound(
      baseInput(decl, {}, {}, record, {}),
    );

    expect(result.consent.consented).toBe(true);
    expect(result.positions).toHaveLength(2);
  });

  it('has the proposer revise when a blocking objection stands', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const result: RoundResult = await runRound(
      baseInput(decl, { sre: blocking('sre') }, {}, record, {}),
    );

    expect(result.consent.consented).toBe(false);
    expect(result.proposal).toBe('revised-proposal');
    const revision: ProposerRequest | undefined =
      record.proposerRequests.at(-1);
    expect(revision?.blocking.map((b) => b.seat)).toEqual(['sre']);
  });

  it('leaves the proposal unrevised when a blocking objection stands and no proposer exists', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', {}),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    const result: RoundResult = await runRound(
      baseInput(decl, { sre: blocking('sre') }, {}, record, {}),
    );

    expect(result.consent.consented).toBe(false);
    expect(result.proposal).toBe('modular-monolith');
    expect(record.proposerRequests).toHaveLength(0);
  });

  it('drafts a proposal in round 1 when none is attached and a proposer exists', async () => {
    const decl: CouncilDeclaration = council([
      seat('architect', { proposer: true }),
      seat('sre', {}),
    ]);
    const record: Recorder = recorder();
    await runRound(baseInput(decl, {}, {}, record, { incomingProposal: null }));

    const draft: ProposerRequest | undefined = record.proposerRequests.at(0);
    expect(draft?.currentProposal).toBeNull();
    expect(record.positionBatches[0]?.[0]?.proposal).toBe('drafted');
  });

  it('fails when no proposal is attached and no proposer exists', async () => {
    const decl: CouncilDeclaration = council([seat('architect', {})]);
    const record: Recorder = recorder();
    await expect(
      runRound(baseInput(decl, {}, {}, record, { incomingProposal: null })),
    ).rejects.toThrow(DeliberationError);
  });

  it('rejects a clarification emitted during the typed-objection phase', async () => {
    const decl: CouncilDeclaration = council([seat('sre', {})]);
    const record: Recorder = recorder();
    const input: RoundInput = baseInput(decl, {}, {}, record, {
      seatInvoker: (
        invocations: readonly SeatInvocation[],
      ): Promise<readonly SeatPosition[]> =>
        Promise.resolve(
          invocations.map((invocation: SeatInvocation): SeatPosition => ({
            seat: invocation.seat.role,
            lens: invocation.seat.lens,
            kind: 'clarification',
            questions: [],
          })),
        ),
    });

    await expect(runRound(input)).rejects.toThrow(DeliberationError);
  });

  it('rejects a typed position emitted during the clarification phase', async () => {
    const decl: CouncilDeclaration = council([seat('sre', {})]);
    const record: Recorder = recorder();
    const input: RoundInput = baseInput(decl, {}, {}, record, {
      seatInvoker: (
        invocations: readonly SeatInvocation[],
      ): Promise<readonly SeatPosition[]> =>
        Promise.resolve(invocations.map((): SeatPosition => consenting('sre'))),
    });

    await expect(runRound(input)).rejects.toThrow(DeliberationError);
  });
});
