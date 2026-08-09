import { describe, expect, it } from 'vitest';
import { AMBIENT_PROPOSAL_CAP } from './ambient-proposal-cap';
import { pendingCandidates } from './pending-candidates';
import type { StagedCandidate } from './staged-candidate';

function candidate(
  principle: string,
  expiresAt: number,
  deliveredAt: number | null = null,
  sessionId: string | null = 'sess-1',
): StagedCandidate {
  return {
    principle,
    confirmingCommand: `omd memory remember "${principle}"`,
    score: 0.8,
    sessionId,
    expiresAt,
    deliveredAt,
  };
}

describe('pendingCandidates', () => {
  it('proposes a staged candidate that was never delivered', () => {
    expect(
      pendingCandidates([candidate('live', 5_000)], 'sess-1', 1_000),
    ).toHaveLength(1);
  });

  it('never proposes a candidate twice', () => {
    expect(
      pendingCandidates([candidate('sent', 5_000, 2_000)], 'sess-1', 3_000),
    ).toEqual([]);
  });

  it('no longer proposes a candidate whose window has passed', () => {
    expect(
      pendingCandidates([candidate('stale', 500)], 'sess-1', 1_000),
    ).toEqual([]);
  });

  it('proposes nothing another session staged', () => {
    expect(
      pendingCandidates(
        [candidate('live', 5_000, null, 'sess-other')],
        'sess-1',
        1_000,
      ),
    ).toEqual([]);
  });

  it('proposes a candidate no session claims to any session', () => {
    expect(
      pendingCandidates(
        [candidate('live', 5_000, null, null)],
        'sess-1',
        1_000,
      ),
    ).toHaveLength(1);
  });

  it('proposes only unclaimed candidates to a prompt naming no session', () => {
    const staged: readonly StagedCandidate[] = [
      candidate('claimed', 5_000, null, 'sess-1'),
      candidate('unclaimed', 5_000, null, null),
    ];

    const pending: readonly StagedCandidate[] = pendingCandidates(
      staged,
      null,
      1_000,
    );

    expect(
      pending.map((entry: StagedCandidate): string => entry.principle),
    ).toEqual(['unclaimed']);
  });

  it('bounds how many proposals one injection carries', () => {
    const staged: readonly StagedCandidate[] = Array.from(
      { length: AMBIENT_PROPOSAL_CAP + 3 },
      (_unused: unknown, index: number): StagedCandidate =>
        candidate(`principle ${index}`, 5_000),
    );

    expect(pendingCandidates(staged, 'sess-1', 1_000)).toHaveLength(
      AMBIENT_PROPOSAL_CAP,
    );
  });
});
