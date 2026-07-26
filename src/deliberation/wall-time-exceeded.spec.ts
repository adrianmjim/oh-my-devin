import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { DeliberationInput } from './deliberation-input';
import { wallTimeExceeded } from './wall-time-exceeded';

function input(wallTimeMs: number | null, now: number): DeliberationInput {
  const council: CouncilDeclaration = {
    name: 'c',
    seats: [],
    tunables: { roundsCap: 3, blockingThreshold: 'high', wallTimeMs },
    authority: 'human',
  };
  return {
    council,
    question: 'q',
    attachedProposal: 'p',
    team: null,
    humanSigned: false,
    seatInvoker: () => Promise.resolve([]),
    proposerAction: () =>
      Promise.resolve({ proposal: 'p', clarifications: [] }),
    clusterArguments: () => Promise.resolve([]),
    summarizeEvidence: () => Promise.resolve(null),
    launch: () => Promise.reject(new Error('not launched')),
    clock: (): number => now,
  };
}

describe('wallTimeExceeded', () => {
  it('is false when the council declares no wall-time cap', () => {
    expect(wallTimeExceeded(input(null, 10_000), 0)).toBe(false);
  });

  it('is false while the elapsed time stays under the cap', () => {
    expect(wallTimeExceeded(input(1000, 500), 0)).toBe(false);
  });

  it('is true once the elapsed time reaches the cap', () => {
    expect(wallTimeExceeded(input(1000, 1000), 0)).toBe(true);
    expect(wallTimeExceeded(input(1000, 2000), 0)).toBe(true);
  });
});
