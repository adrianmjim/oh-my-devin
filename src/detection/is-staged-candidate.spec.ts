import { describe, expect, it } from 'vitest';
import { isStagedCandidate } from './is-staged-candidate';

describe('isStagedCandidate', () => {
  it('recognizes a staged candidate', () => {
    expect(
      isStagedCandidate({
        principle: 'In this project, always lint.',
        confirmingCommand: 'omd memory remember "In this project, always lint."',
        score: 0.8,
        expiresAt: 5_000,
        deliveredAt: null,
      }),
    ).toBe(true);
  });

  it('rejects staging that lost a field', () => {
    expect(
      isStagedCandidate({ principle: 'p', score: 0.8, expiresAt: 1 }),
    ).toBe(false);
    expect(isStagedCandidate(null)).toBe(false);
  });
});
