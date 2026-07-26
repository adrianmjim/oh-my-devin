import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import type { ConsentResult } from './consent-result';
import { integrateObjections } from './integrate-objections';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import type { RoundInput } from './round-input';
import type { TypedPosition } from './typed-position';

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

const BLOCKING: TypedPosition = {
  seat: 'security',
  lens: 'auth',
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'leak',
  assumptions: [],
  reconsiderWhen: [],
};

const CONSENTED: ConsentResult = { consented: true, blocking: [] };
const BLOCKED: ConsentResult = { consented: false, blocking: [BLOCKING] };

describe('integrateObjections', () => {
  it('keeps the proposal when the council consented', async () => {
    expect(
      await integrateObjections(
        input([seat('a', true)], () =>
          Promise.resolve({
            proposal: 'revised',
            clarifications: [],
          }),
        ),
        'ship it',
        CONSENTED,
      ),
    ).toBe('ship it');
  });

  it('keeps the proposal when no seat can revise it', async () => {
    expect(
      await integrateObjections(
        input([seat('a', false)], () =>
          Promise.resolve({
            proposal: 'revised',
            clarifications: [],
          }),
        ),
        'ship it',
        BLOCKED,
      ),
    ).toBe('ship it');
  });

  it('asks the proposer to revise against the blocking objections', async () => {
    const requests: ProposerRequest[] = [];

    const proposal: string = await integrateObjections(
      input([seat('a', true)], (request: ProposerRequest) => {
        requests.push(request);
        return Promise.resolve({ proposal: 'revised', clarifications: [] });
      }),
      'ship it',
      BLOCKED,
    );

    expect(proposal).toBe('revised');
    expect(requests[0]?.blocking).toEqual([BLOCKING]);
    expect(requests[0]?.clarificationQuestions).toEqual([]);
  });
});
