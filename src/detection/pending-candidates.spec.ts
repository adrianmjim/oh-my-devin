import { describe, expect, it } from 'vitest';
import { AMBIENT_PROPOSAL_CAP } from './ambient-proposal-cap';
import { pendingCandidates } from './pending-candidates';
import type { StagedCandidate } from './staged-candidate';

function candidate(
  principle: string,
  expiresAt: number,
  deliveredAt: number | null = null,
): StagedCandidate {
  return {
    principle,
    confirmingCommand: `omd memory remember "${principle}"`,
    score: 0.8,
    expiresAt,
    deliveredAt,
  };
}

describe('pendingCandidates', () => {
  it('proposes a staged candidate that was never delivered', () => {
    expect(
      pendingCandidates([candidate('live', 5_000)], 1_000),
    ).toHaveLength(1);
  });

  it('never proposes a candidate twice', () => {
    expect(pendingCandidates([candidate('sent', 5_000, 2_000)], 3_000)).toEqual(
      [],
    );
  });

  it('no longer proposes a candidate whose window has passed', () => {
    expect(pendingCandidates([candidate('stale', 500)], 1_000)).toEqual([]);
  });

  it('bounds how many proposals one injection carries', () => {
    const staged: readonly StagedCandidate[] = Array.from(
      { length: AMBIENT_PROPOSAL_CAP + 3 },
      (_unused: unknown, index: number): StagedCandidate =>
        candidate(`principle ${index}`, 5_000),
    );

    expect(pendingCandidates(staged, 1_000)).toHaveLength(AMBIENT_PROPOSAL_CAP);
  });
});
