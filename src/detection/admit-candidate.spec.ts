import { describe, expect, it } from 'vitest';
import { admitCandidate } from './admit-candidate';
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

describe('admitCandidate', () => {
  it('stages a candidate the staging does not hold yet', () => {
    const staged: readonly StagedCandidate[] = admitCandidate(
      [],
      candidate('always lint', 2_000),
      1_000,
    );

    expect(staged).toHaveLength(1);
  });

  it('collapses a principle already staged for the same session', () => {
    const first: readonly StagedCandidate[] = admitCandidate(
      [],
      candidate('always lint', 2_000),
      1_000,
    );

    const second: readonly StagedCandidate[] = admitCandidate(
      first,
      candidate('always lint', 9_000),
      1_000,
    );

    expect(second).toHaveLength(1);
    expect(second[0]?.expiresAt).toBe(2_000);
  });

  it('admits the same principle detected in another session', () => {
    const first: readonly StagedCandidate[] = admitCandidate(
      [],
      candidate('always lint', 2_000, null, 'sess-1'),
      1_000,
    );

    const second: readonly StagedCandidate[] = admitCandidate(
      first,
      candidate('always lint', 9_000, null, 'sess-2'),
      1_000,
    );

    expect(second).toHaveLength(2);
  });

  it('drops candidates whose expiry window has passed', () => {
    const held: readonly StagedCandidate[] = [
      candidate('stale principle', 500),
      candidate('live principle', 5_000),
    ];

    const staged: readonly StagedCandidate[] = admitCandidate(
      held,
      candidate('new principle', 6_000),
      1_000,
    );

    expect(
      staged.map((entry: StagedCandidate): string => entry.principle),
    ).toEqual(['live principle', 'new principle']);
  });

  it('leaves the staging it was given untouched', () => {
    const held: readonly StagedCandidate[] = [candidate('held', 5_000)];

    admitCandidate(held, candidate('new', 6_000), 1_000);

    expect(held).toHaveLength(1);
  });
});
