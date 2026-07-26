import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import { resolveProposal } from './resolve-proposal';
import type { RoundInput } from './round-input';

function seat(id: string, proposer: boolean): CouncilSeat {
  return { id, role: id, lens: id, proposer, contrarian: false, model: null };
}

function input(
  incomingProposal: string | null,
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
    incomingProposal,
    priorPositions: [],
    evidenceSummary: null,
    seatInvoker: () => Promise.resolve([]),
    proposerAction,
  };
}

describe('resolveProposal', () => {
  it('keeps the incoming proposal when the round carries one', async () => {
    expect(
      await resolveProposal(
        input('ship it', [seat('a', true)], () =>
          Promise.resolve({
            proposal: 'drafted',
            clarifications: [],
          }),
        ),
      ),
    ).toBe('ship it');
  });

  it('asks the proposer to draft one when the round carries none', async () => {
    const requests: ProposerRequest[] = [];

    const proposal: string = await resolveProposal(
      input(null, [seat('a', true)], (request: ProposerRequest) => {
        requests.push(request);
        return Promise.resolve({ proposal: 'drafted', clarifications: [] });
      }),
    );

    expect(proposal).toBe('drafted');
    expect(requests[0]?.currentProposal).toBeNull();
  });

  it('refuses a deliberation with neither a proposal nor a proposer', async () => {
    await expect(
      resolveProposal(
        input(null, [seat('a', false)], () =>
          Promise.resolve({
            proposal: 'p',
            clarifications: [],
          }),
        ),
      ),
    ).rejects.toThrow(DeliberationError);
  });
});
